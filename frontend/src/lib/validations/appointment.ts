import { z } from "zod";

export const appointmentSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  vehicleId: z.number().nullable(),
  assignedMechanicId: z.number().nullable(),
  serviceType: z.string().max(100),
  scheduledDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().max(500),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
