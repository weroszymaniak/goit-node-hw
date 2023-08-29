import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "./../../service/schemas/users.js";
import { auth } from "../../config/config-passport.js";

import { getUserById, addUser, loginUser } from "../../models/users.js";
import Joi from "joi";

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

usersRouter.get("/logout", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" }); // Unauthorized error
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
