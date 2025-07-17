import { Request, Response } from "express";
import * as roomService from "../services/room.service";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    data.createdBy = (req.user as any).id; // Assuming user ID is stored in req.user

    // Validate body
    if (!data.name) {
      return res
        .status(400)
        .json({ result: false, message: "Room name is required!" });
    }

    if (data.name.length < 3) {
      return res.status(400).json({
        result: false,
        message: "Room name must be at least 3 characters long!",
      });
    }

    const { recordset: room } = await roomService.createRoom(data);

    if (!room || room.length === 0) {
      return res.status(500).json({
        result: false,
        message: "Room creation failed, please try again",
      });
    }

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
    data.userId = (req.user as any).id;

    // Validate body
    if (!data.roomId) {
      return res
        .status(400)
        .json({ result: false, message: "Room ID is required to join a room" });
    }

    if (!data.userId) {
      return res
        .status(400)
        .json({ result: false, message: "User ID is required to join a room" });
    }

    const { recordset: existingParticipant } =
      await roomService.checkParticipant(data);

    if (existingParticipant && existingParticipant.length > 0) {
      return res.status(400).json({
        result: false,
        message: "You are already a participant in this room",
      });
    }

    const { recordset: room } = await roomService.joinRoom(data);

    if (!room || room.length === 0) {
      return res.status(404).json({
        result: false,
        message: "Room not found or you are already a participant",
      });
    }

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
      return res
        .status(400)
        .json({ result: false, message: "Room ID is required" });
    }

    const { recordset: room } = await roomService.getRoomById(roomId);

    if (!room || room.length === 0) {
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
    const userId = (req.user as any).id;
    console.log("Fetching rooms for user:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ result: false, message: "User ID is required" });
    }

    const { recordset: rooms } = await roomService.getRoomsByUserId(userId);

    if (!rooms || rooms.length === 0) {
      return res.status(204).json({
        result: true,
        message: "No rooms found for this user",
      });
    }

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
};

export const newMessage = async (req: Request, res: Response) => {
  try {
    const data = {
      roomId: req.params.id,
      senderId: (req.user as any).id,
      content: req.body.content,
    };

    // Validate body
    if (!data.roomId) {
      return res
        .status(400)
        .json({ result: false, message: "Room ID is required" });
    }

    if (!data.senderId) {
      return res
        .status(400)
        .json({ result: false, message: "Sender ID is required" });
    }

    if (!data.content) {
      return res
        .status(400)
        .json({ result: false, message: "Message content is required" });
    }

    await roomService.newMessage(data);
    
    const { recordset: message } = await roomService.getMessage(data.roomId);

    if (!message || message.length === 0) {
      return res.status(500).json({
        result: false,
        message: "Failed to send message, please try again",
      });
    }

    return res.status(201).json({
      result: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "Failed to send message",
    });
  }
};

export const getMessage = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;

    if (!roomId) {
      return res.status(400).json({
        result: false,
        message: "Room ID is required to fetch messages",
      });
    }

    const { recordset: messages } = await roomService.getMessage(roomId);

    if (!messages || messages.length === 0) {
      return res.status(204).json({
        result: true,
        message: "No messages found for this room",
      });
    }

    return res.status(200).json({
      result: true,
      data: messages,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({
      result: false,
      message: error.message || "Failed to fetch messages",
    });
  }
};
