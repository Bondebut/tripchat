import { Request, Response } from "express";
import * as roomService from "../services/room.service";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Validate body
    if (!data.name) {
      return res.status(400).json({ result: false, message: "Room name is required!" });
    }

    if (data.name.length < 3) {
      return res.status(400).json({ result: false, message: "Room name must be at least 3 characters long!" });
    }

    const room = await roomService.createRoom(data);

    return res.status(201).json({
      result: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error: any) {
    console.error("Error creating room:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "Room creation failed",
    });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Validate body
    if (!data.roomId) {
      return res.status(400).json({ result: false, message: "Room ID is required to join a room" });
    }

    if (!data.userId) {
      return res.status(400).json({ result: false, message: "User ID is required to join a room" });
    }

    const room = await roomService.joinRoom(data);

    return res.status(200).json({
      result: true,
      message: "Joined room successfully",
      data: room,
    });
  } catch (error: any) {
    console.error("Error joining room:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "Failed to join room",
    });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;

    if (!roomId) {
      return res.status(400).json({ result: false, message: "Room ID is required" });
    }

    const room = await roomService.getRoomById(roomId);

    if (!room) {
      return res.status(404).json({ result: false, message: "Room not found" });
    }

    return res.status(200).json({
      result: true,
      data: room,
    });
  } catch (error: any) {
    console.error("Error fetching room:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "Failed to fetch room",
    });
  }
};

export const getRoomsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    // console.log("Fetching rooms for user:", userId);

    if (!userId) {
      return res.status(400).json({ result: false, message: "User ID is required" });
    }

    const rooms = await roomService.getRoomsByUserId(userId);

    return res.status(200).json({
      result: true,
      data: rooms,
    });
  } catch (error: any) {
    console.error("Error fetching rooms by user:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "Failed to fetch rooms",
    });
  }
}