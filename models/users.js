import User from "./../service/schemas/users.js";
import bcrypt from "bcrypt";

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

    const newUser = { ...body, password: hashedPassword };
    const createdUser = await User.create(newUser);

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
