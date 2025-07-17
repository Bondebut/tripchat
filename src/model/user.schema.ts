import { z } from "zod";

export const RegisterSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;