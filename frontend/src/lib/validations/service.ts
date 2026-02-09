import { z } from "zod";

export const serviceCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500),
});

export type ServiceCategoryFormData = z.infer<typeof serviceCategorySchema>;

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  description: z.string().max(500),
  categoryId: z.number().min(1, "Category is required"),
  basePrice: z.number().min(0, "Price must be positive"),
  estimatedDuration: z.number().min(1, "Duration is required (minutes)"),
  isActive: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
