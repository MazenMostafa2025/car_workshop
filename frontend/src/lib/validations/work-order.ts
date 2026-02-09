import { z } from "zod";

export const workOrderSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  vehicleId: z.number().min(1, "Vehicle is required"),
  assignedMechanicId: z.number().nullable(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"], {
    message: "Priority is required",
  }),
  description: z.string().max(1000),
  diagnosis: z.string().max(1000),
  estimatedCompletionDate: z.string(),
  notes: z.string().max(1000),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export const workOrderServiceSchema = z.object({
  serviceId: z.number().min(1, "Service is required"),
  mechanicId: z.number().nullable(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
  notes: z.string().max(500),
});

export type WorkOrderServiceFormData = z.infer<typeof workOrderServiceSchema>;

export const workOrderPartSchema = z.object({
  partId: z.number().min(1, "Part is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
});

export type WorkOrderPartFormData = z.infer<typeof workOrderPartSchema>;
