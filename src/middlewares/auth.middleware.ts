import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { getUserExits } from "../services/user.service";

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
  const { email } = req.user as { email: string };
  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { recordset } = await getUserExits(email);
  const userRole = recordset[0]?.role;

  if (userRole !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  next();
};
