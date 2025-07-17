import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.post("/register", registerUser as any);
userRoutes.post("/login", loginUser as any);

export default userRoutes;