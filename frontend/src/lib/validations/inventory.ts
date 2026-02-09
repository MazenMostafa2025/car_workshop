import { z } from "zod";

export const partSchema = z.object({
  name: z.string().min(1, "Part name is required").max(100),
  partNumber: z.string().max(50),
  description: z.string().max(500),
  category: z.string().max(50),
  supplierId: z.number().nullable(),
  unitCost: z.number().min(0, "Unit cost must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  quantityInStock: z.number().min(0, "Quantity must be 0 or more"),
  reorderLevel: z.number().min(0, "Reorder level must be 0 or more"),
  location: z.string().max(100),
  isActive: z.boolean(),
});

export type PartFormData = z.infer<typeof partSchema>;

export const stockAdjustmentSchema = z.object({
  adjustmentType: z.enum(["ADD", "REMOVE", "SET"], {
    message: "Adjustment type is required",
  }),
  quantity: z.number().min(0, "Quantity must be positive"),
  reason: z.string().min(1, "Reason is required").max(200),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
