import { Server } from "socket.io";
import http from "http";
import { newMessage ,getMessage} from "../services/room.service";
import { verifyToken } from "../untils/auth.untils";

export let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: any) => {
    console.log(`User connected: ${socket.id}`);

    io.of("/").adapter.sids.forEach((rooms, sid) => {
      console.log("🔗 Active Socket:", sid);
    });

    socket.on("joinRoom", async (roomId: string) => {
      socket.join(roomId);
      const { recordset: messages } = await getMessage(roomId);
      console.log(`User ${socket.data.user.id} joined room: ${roomId}`);

      socket.emit("chatHistory", messages);
    });

    socket.on("sendMessage", async (data: any) => {
      const { roomId, content } = data;
      const senderId = socket.data.user.id;
      if (!roomId || !senderId || !content) {
        return socket.emit("error", { message: "Invalid message data" });
      }
      console.log(
        `New message in room ${roomId} from user ${senderId}: ${content}`
      );
      
      await newMessage({ roomId, senderId, content });

      const { recordset: result } = await getMessage(roomId);
       
        if (!result || result.length === 0) {
            return socket.emit("error", { message: "Failed to send message" });
        }


      io.to(roomId).emit("newMessage", {
        ...result[0]
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on("leaveRoom", (roomId: string) => {
      socket.leave(roomId);
    });
  });
};
