import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "./../../service/schemas/users.js";
import { auth } from "../../config/config-passport.js";
import {
  getUserById,
  addUser,
  loginUser,
  resizeAndSaveAvatar,
} from "../../models/users.js";

import Joi from "joi";
import multer from "multer";
import path from "path";
import Jimp from "jimp";
import fs from "fs/promises";

dotenv.config();
export const usersRouter = express.Router();

usersRouter.post("/signup", async (req, res, next) => {
  const signupValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  try {
    const { error } = signupValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json(error.details);
    }

    const { email, password } = req.body;

    const result = await addUser({ email, password });

    if (result.status === 409) {
      return res.status(409).json({ message: "Email in use" });
    }

    const { user } = result;

    return res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Error during signup: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

usersRouter.post("/login", async (req, res) => {
  const loginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  try {
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json(error.details);
    }

    const { email, password } = req.body;

    const loginResult = await loginUser({ email, password });

    if (!loginResult) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    const payload = {
      id: loginResult.user.id,
      username: loginResult.user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return res.status(200).json({
      token,
      user: {
        email: loginResult.user.email,
        subscription: loginResult.user.subscription,
      },
    });
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAvatar = multer({ storage: avatarStorage });

usersRouter.patch(
  "/avatars",
  auth,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      console.log("User Data:", req.user);
      const { id: userId } = req.user;
      console.log(req.user);
      const avatarPath = req.file.path;
      console.log("Avatar Path:", avatarPath);

      const avatarURL = await resizeAndSaveAvatar(avatarPath, userId);

      return res.status(200).json({ avatarURL });
    } catch (error) {
      console.error("Error during avatar upload: ", error);
      console.error(error.stack);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

usersRouter.get("/logout", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    return res.status(204).end();
  } catch (error) {
    console.error("Error during logout: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

usersRouter.get("/current", auth, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    return res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error while fetching current user data: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
