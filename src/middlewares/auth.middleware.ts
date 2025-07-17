import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { getUserByEmail } from "../services/user.service";
import { getRoomsByUserId } from "../services/room.service";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  next();
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user as { email: string };
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { recordset } = await getUserByEmail(email);
    const userRole = recordset[0];

    if (!userRole) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userRole.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
  } catch (error) {
    console.error("Error checking admin role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

  next();
};

export const isUserInRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any).id;

    console.log("Checking if user is in room:", userId);

    const rooms = await getRoomsByUserId(userId);
    console.log("Rooms for user:", rooms);

    if (!rooms || rooms.length === 0) {
      return res.status(403).json({
        result: false,
        message: "User is not part of any room",
      });
    }
    
    next();
  } catch (error) {
    console.error("Error checking room access:", error);
    return res.status(500).json({
      result: false,
      message: "Internal server error while checking room access",
    });
  }
};
