import { z } from "zod";

export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string().min(1, "Phone is required").max(20),
  address: z.string().max(200),
  city: z.string().max(100),
  postalCode: z.string().max(20),
  notes: z.string().max(500),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
