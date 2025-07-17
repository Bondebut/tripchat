import { z } from "zod";

export const CreateRoomSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["chat", "video", "audio"]),
  createdBy: z.string().uuid(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;