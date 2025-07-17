import { Request, Response } from "express";
import * as userService from "../services/user.service";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    //Validate body
    if (!data.email) {
      //
      return res.status(400).json({result: false, message: "Email is require!!" });
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      return res.status(400).json({result: false, message: "Invalid email format!" });
    }

    if (data.password.length < 8) {
      return res
        .status(400)
        .json({result: false, message: "Password must be at least 8 characters long!" });
    }

    // console.log("Registering user with data:", data);

    const user = await userService.registerUser(data);

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
    const email = data.email.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is require!!" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    if (data.password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long!" });
    }

    const user = await userService.loginUser(data);

    const payload = {
      username: user.username,
      email: user.email,
    };
    console.log("User found:", user);
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
              id: user.id,
              username: user.username,
              email: user.email,
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
