import { Router } from "express";
import { createRoom, joinRoom, getRoomsByUser,newMessage,getMessage } from "../controllers/room.controller";
import {isAuthenticated, isAdmin, isUserInRoom} from "../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.post("/room", isAuthenticated as any, createRoom as any);
userRoutes.post("/room/join", isAuthenticated as any, joinRoom as any);
userRoutes.get("/room", isAuthenticated as any, getRoomsByUser as any);
userRoutes.post("/rooms/:id/message", isAuthenticated as any, isUserInRoom as any, newMessage as any);
userRoutes.get("/rooms/:id/message", isAuthenticated as any, getMessage as any);


export default userRoutes;