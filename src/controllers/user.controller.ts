import { Request, Response } from "express";
import * as userService from "../services/user.service";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    //Validate body
    if (!data.email) {
      //
      return res
        .status(400)
        .json({ result: false, message: "Email is require!!" });
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      return res
        .status(400)
        .json({ result: false, message: "Invalid email format!" });
    }

    if (data.password.length < 8) {
      return res.status(400).json({
        result: false,
        message: "Password must be at least 8 characters long!",
      });
    }

    const { recordset: existingUser } = await userService.getUserByEmail(
      data.email
    );

    if (existingUser && existingUser.length > 0) {
      return res
        .status(400)
        .json({ result: false, message: "Email already exists!" });
    }

    const { recordset: user } = await userService.registerUser(data);

    if (!user || user.length === 0) {
      return res
        .status(400)
        .json({ result: false, message: "User registration failed" });
    }

    return res.status(201).json({
      result: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Error registering user:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "User registration failed",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.email) {
      return res.status(400).json({ message: "Email is require!!" });
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    if (data.password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long!" });
    }

    const { recordset: user } = await userService.getUserByEmail(data.email);

    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const isPasswordValid = await userService.comparePassword(
      data.password,
      user[0].password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const payload = {
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
    };

    // Generate JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          console.error("Error generating JWT token:", err);
          return res.status(500).json({ message: "Token generation failed" });
        }

        return res.status(200).json({
          result: true,
          message: "User logged in successfully",
          data: {
            user: {
              username: user[0].username,
              email: user[0].email,
            },
            token: token,
          },
        });
      }
    );
  } catch (error: any) {
    console.error("Error logging in user:", error.message);
    return res
      .status(500)
      .json({ result: false, message: error.message || "User login failed" });
  }
};
