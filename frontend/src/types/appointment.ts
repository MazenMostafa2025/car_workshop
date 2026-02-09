export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: number;
  customerId: number;
  vehicleId: number | null;
  assignedMechanicId: number | null;
  serviceType: string | null;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: number; firstName: string; lastName: string; phone: string };
  vehicle?: {
    id: number;
    make: string;
    model: string;
    year: number;
    licensePlate: string | null;
  };
  assignedMechanic?: { id: number; firstName: string; lastName: string };
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}
