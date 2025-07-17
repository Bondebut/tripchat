import { z } from "zod";

export const CreateTripSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  createdBy: z.string().uuid(),
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;