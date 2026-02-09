import { z } from "zod";

export const purchaseOrderSchema = z.object({
  supplierId: z.number().min(1, "Supplier is required"),
  expectedDeliveryDate: z.string(),
  notes: z.string().max(500),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export const purchaseOrderItemSchema = z.object({
  partId: z.number().min(1, "Part is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Cost must be positive"),
});

export type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemSchema>;
