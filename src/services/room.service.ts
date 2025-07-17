import { v4 as uuidv4 } from "uuid";
import { safeExec } from "../sqlhelpers/safeExec";
import { exec } from "../sqlhelpers/exec";

export const createRoom = async (data: any) => {
  data.id = uuidv4();
  data.name = data.name.trim();
  data.type = data.type ? data.type.trim() : "public";
  data.createdAt = new Date();
  data.createdBy = data.createdBy || null;

  const existingRoom = await safeExec("check-room-exists", () =>
    exec((req) =>
      req
        .input("name", data.name)
        .query("SELECT * FROM [Room] WHERE name = @name")
    )
  );

  if (existingRoom && existingRoom.recordset.length > 0) {
    throw new Error("Room with this name already exists!");
  }

  const result = await safeExec("create-room", () =>
    exec((req) =>
      req
        .input("id", data.id)
        .input("name", data.name)
        .input("type", data.type || "public")
        .input("createdAt", data.createdAt)
        .input("createdBy", data.createdBy)
        .query(
          `BEGIN TRANSACTION;

            INSERT INTO [Room] (id, name, type, isActive, createdAt, createdBy) 
            VALUES (@id, @name, @type, 1, @createdAt, @createdBy);

            INSERT INTO [RoomParticipant] (roomId, userId, joinedAt, isHost)
            VALUES (@id, @createdBy, @createdAt, 1);

            SELECT * FROM [Room] WHERE id = @id;

            COMMIT;
           `
        )
    )
  );

  if (!result) {
    throw new Error("Room creation failed, please try again");
  }

  return result.recordset[0];
};

export const joinRoom = async (data: any) => {
  if (!data.roomId) {
    throw new Error("Room ID is required to join a room");
  }

  if (!data.userId) {
    throw new Error("User ID is required to join a room");
  }

  const existingParticipant = await safeExec("check-participant-exists", () =>
    exec((req) =>
      req
        .input("roomId", data.roomId)
        .input("userId", data.userId)
        .query(
          "SELECT * FROM [RoomParticipant] WHERE roomId = @roomId AND userId = @userId"
        )
    )
  );

  if (existingParticipant && existingParticipant.recordset.length > 0) {
    throw new Error("You are already a participant in this room");
  }

  const result = await safeExec("join-room", () =>
    exec((req) =>
      req
        .input("roomId", data.roomId)
        .input("userId", data.userId)
        .input("joinedAt", new Date())
        .query(
          `INSERT INTO [RoomParticipant] (roomId, userId, joinedAt, isHost)
           VALUES (@roomId, @userId, @joinedAt, 0);
           SELECT * FROM [RoomParticipant] WHERE roomId = @roomId AND userId = @userId;`
        )
    )
  );

  if (!result || result.recordset.length === 0) {
    throw new Error("Failed to join the room, please try again");
  }

  return result.recordset[0];
}

export const getRoomById = async (roomId: string) => {
  if (!roomId) {
    throw new Error("Room ID is required");
  }

  const result = await safeExec("get-room-by-id", () =>
    exec((req) =>
      req
        .input("roomId", roomId)
        .query("SELECT * FROM [Room] WHERE id = @roomId")
    )
  );

  if (!result || result.recordset.length === 0) {
    throw new Error("Room not found");
  }

  return result.recordset[0];
};

export const getRoomsByUserId = async (userId: string) => {
    // console.log("Fetching rooms for user:", userId);
  if (!userId) {
    throw new Error("User ID is required");
  }

  const result = await safeExec("get-rooms-by-user-id", () =>
    exec((req) =>
      req
        .input("userId", userId)
        .query(`
          SELECT r.id,r.name,r.type,r.isActive,r.createdAt,rp.joinedAt,u.username AS hostName 
          FROM [Room] r
          JOIN [RoomParticipant] rp ON r.id = rp.roomId
          JOIN [User] u ON rp.userId = u.id
          WHERE rp.userId = @userId
        `)
    )
  );

  return result ? result.recordset : [];
};
