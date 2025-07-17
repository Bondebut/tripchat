import { z } from "zod";

export const AddExpenseSchema = z.object({
  planId: z.string().uuid(),
  title: z.string(),
  amount: z.coerce.number().positive(),
  paidBy: z.string().uuid(),
  shares: z.array(z.object({
    userId: z.string().uuid(),
    amount: z.coerce.number().positive()
  }))
});

export type AddExpenseInput = z.infer<typeof AddExpenseSchema>;