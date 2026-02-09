import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20),
  role: z.enum(["ADMIN", "MANAGER", "MECHANIC", "RECEPTIONIST"], {
    message: "Role is required",
  }),
  specialization: z.string().max(100),
  hireDate: z.string().min(1, "Hire date is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .or(z.literal("")),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
