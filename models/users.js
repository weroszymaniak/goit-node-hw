import User from "./../service/schemas/users.js";
import bcrypt from "bcrypt";
import gravatar from "gravatar";
import Jimp from "jimp";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "../service/email/sendGridService.js";

export const listUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.error("Error getting contacts:", error.message);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    return await User.findOne({ _id: userId });
  } catch (error) {
    console.log("Error getting user by ID:", error.message);
    throw error;
  }
};

export const addUser = async (body) => {
  const { email, password } = body;

  try {
    const users = await User.find();
    const userExists = users.some((user) => user.email === email);

    if (userExists) {
      return { status: 409, message: "Email in use" };
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatarURL = gravatar.url(email, {
      s: "250",
      r: "pg",
      d: "identicon",
    });

    const verificationToken = nanoid();

    const newUser = {
      ...body,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    };
    const createdUser = await User.create(newUser);
    await sendVerificationEmail(createdUser.email, verificationToken);

    return {
      status: 201,
      message: "User added successfully",
      user: createdUser,
    };
  } catch (error) {
    console.error("Error adding new user: ", error);
    throw error;
  }
};

export const loginUser = async (body) => {
  const { email, password } = body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return false;
    }
    const passwordMatch = bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return false;
    }

    return {
      status: 200,
      message: "User logged successfully",
      user,
    };
  } catch (error) {
    console.error("Error logging: ", error);
    throw error;
  }
};

export const resizeAndSaveAvatar = async (avatarPath, userId) => {
  try {
    const avatar = await Jimp.read(avatarPath);
    avatar.resize(250, 250).write(avatarPath);

    const avatarFileName = path.basename(avatarPath);

    const publicAvatarPath = path.join("public/avatars", avatarFileName);

    await fs.rename(avatarPath, publicAvatarPath);

    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.avatarURL = `/avatars/${avatarFileName}`;
    await user.save();

    return user.avatarURL;
  } catch (error) {
    console.error("Error during avatar upload: ", error);
    throw error;
  }
};

export const patchAvatar = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const avatarPath = req.file.path;

    const avatarURL = await resizeAndSaveAvatar(avatarPath, userId);

    return res.status(200).json({ avatarURL });
  } catch (error) {
    console.error("Error during avatar upload: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyUserByToken = async (verificationToken) => {
  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return { status: 404 };
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    return { status: 200, message: "Verification successful" };
  } catch (error) {
    console.error("Error during user verification: ", error);
    throw error;
  }
};
