import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(100),
  contactPerson: z.string().max(100),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().max(20),
  address: z.string().max(200),
  city: z.string().max(100),
  postalCode: z.string().max(20),
  notes: z.string().max(500),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
