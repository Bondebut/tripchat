import { Router } from "express";
import { createRoom, joinRoom, getRoomsByUser } from "../controllers/room.controller";

const userRoutes = Router();

userRoutes.post("/room", createRoom as any);
userRoutes.post("/room/join", joinRoom as any);
userRoutes.get("/room/:id", getRoomsByUser as any);

export default userRoutes;