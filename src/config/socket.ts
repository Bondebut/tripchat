import { Server } from "socket.io";
import http from "http";
import { newMessage } from "../services/room.service";

export let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: any) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", async (data: any) => {
      const { roomId, senderId, content } = data;
        if (!roomId || !senderId || !content) {
            return socket.emit("error", { message: "Invalid message data" });
        }
      await newMessage(data);

      io.to(roomId).emit("NewMessage", {
        roomId,
        senderId,
        content,
        sentAt: new Date(),
      });
    });

    socket.on("leaveRoom", (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
