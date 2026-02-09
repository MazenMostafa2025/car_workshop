import { z } from "zod";

export const vehicleSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  make: z.string().min(1, "Make is required").max(50),
  model: z.string().min(1, "Model is required").max(50),
  year: z
    .number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 2, "Invalid year"),
  vin: z.string().max(17),
  licensePlate: z.string().max(20),
  color: z.string().max(30),
  mileage: z.number().min(0).optional(),
  engineType: z.string().max(50),
  transmissionType: z.string().max(50),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
