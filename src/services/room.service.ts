import { v4 as uuidv4 } from "uuid";
import { safeExec } from "../sqlhelpers/safeExec";
import { exec } from "../sqlhelpers/exec";

export const createRoom = async (data: any) => {
  data.id = uuidv4();
  data.name = data.name.trim();
  data.type = data.type ? data.type.trim() : "public";
  data.createdAt = new Date();
  data.createdBy = data.createdBy || null;

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
  return result;
};

export const checkParticipant = async (data: any) => {
  const result = await safeExec("check-participant-exists", () =>
    exec((req) =>
      req
        .input("roomId", data.roomId)
        .input("userId", data.userId)
        .query(
          "SELECT * FROM [RoomParticipant] WHERE roomId = @roomId AND userId = @userId"
        )
    )
  );
  return result;
};

export const joinRoom = async (data: any) => {
  const result = await safeExec("join-room", () =>
    exec((req) =>
      req
        .input("roomId", data.roomId)
        .input("userId", data.userId)
        .input("joinedAt", new Date())
        .query(
          `INSERT INTO [RoomParticipant] (roomId, userId, joinedAt, isHost)
           VALUES (@roomId, @userId, @joinedAt, 0);

           SELECT rp.id, rp.roomId, rp.userId, rp.joinedAt, rp.isHost, u.username AS userName
           FROM [RoomParticipant] rp
           JOIN [User] u ON rp.userId = u.id
           WHERE rp.roomId = @roomId AND rp.userId = @userId;`
        )
    )
  );
  return result;
};

export const getRoomById = async (roomId: string) => {
  const result = await safeExec("get-room-by-id", () =>
    exec((req) =>
      req
        .input("roomId", roomId)
        .query("SELECT * FROM [Room] WHERE id = @roomId")
    )
  );
  return result;
};

export const getRoomsByUserId = async (userId: string) => {
  const result = await safeExec("get-rooms-by-user-id", () =>
    exec((req) =>
      req.input("userId", userId).query(`
          SELECT r.id,r.name,r.type,r.isActive,r.createdAt,rp.joinedAt,u.username AS hostName 
          FROM [Room] r
          JOIN [RoomParticipant] rp ON r.id = rp.roomId
          JOIN [User] u ON rp.userId = u.id
          WHERE rp.userId = @userId
        `)
    )
  );
  return result;
};

export const newMessage = async (data: any) => {
  data.id = uuidv4();
  const result = await safeExec("new-message", () =>
    exec((req) =>
      req
        .input("id", data.id)
        .input("roomId", data.roomId)
        .input("senderId", data.senderId)
        .input("content", data.content)
        .input("sentAt", new Date()).query(`
          INSERT INTO [Message] (id, roomId, senderId, content, sentAt)
          VALUES (@id, @roomId, @senderId, @content, @sentAt);
        `)
    )
  );
  return result;
};

export const getMessage = async (roomId: string) => {
  const result = await safeExec("get-messages-by-room-id", () =>
    exec((req) =>
      req.input("roomId", roomId).query(`
          SELECT m.id, m.roomId, m.senderId, m.content, m.sentAt, u.username AS senderName
          FROM [Message] m
          JOIN [User] u ON m.senderId = u.id
          WHERE m.roomId = @roomId
          ORDER BY m.sentAt ASC
          OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY;
        `)
    )
  );
  return result;
};
