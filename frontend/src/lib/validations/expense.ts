import { z } from "zod";

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required").max(50),
  amount: z.number().min(0.01, "Amount must be positive"),
  vendor: z.string().max(100),
  description: z.string().max(500),
  expenseDate: z.string().min(1, "Date is required"),
  reference: z.string().max(100),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
