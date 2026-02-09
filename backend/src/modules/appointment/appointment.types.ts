import type { Appointment, Customer, Vehicle, Employee, AppointmentStatus } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateAppointmentDto {
  customerId: number;
  vehicleId: number;
  appointmentDate: string;
  duration?: number;
  serviceType?: string | null;
  assignedMechanicId?: number | null;
  notes?: string | null;
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  duration?: number;
  serviceType?: string | null;
  assignedMechanicId?: number | null;
  notes?: string | null;
}

export interface AppointmentStatusDto {
  status: AppointmentStatus;
}

// ── Query Filters ─────────────────────────────────────────

export interface AppointmentListQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  customerId?: number;
  mechanicId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'appointmentDate' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type AppointmentFull = Appointment & {
  customer: Customer;
  vehicle: Vehicle;
  assignedMechanic: Employee | null;
};

// ── Status transition map ─────────────────────────────────

export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
