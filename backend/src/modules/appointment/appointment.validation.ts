import { z } from 'zod';

// ── Create ────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  body: z.object({
    customerId: z.coerce.number().int().positive(),
    vehicleId: z.coerce.number().int().positive(),
    appointmentDate: z.string().datetime({ offset: true }),
    duration: z.coerce.number().int().positive().default(60),
    serviceType: z.string().max(100).nullish(),
    assignedMechanicId: z.coerce.number().int().positive().nullish(),
    notes: z.string().max(1000).nullish(),
  }),
});

// ── Update ────────────────────────────────────────────────

export const updateAppointmentSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    appointmentDate: z.string().datetime({ offset: true }).optional(),
    duration: z.coerce.number().int().positive().optional(),
    serviceType: z.string().max(100).nullish(),
    assignedMechanicId: z.coerce.number().int().positive().nullish(),
    notes: z.string().max(1000).nullish(),
  }),
});

// ── Status Transition ─────────────────────────────────────

export const appointmentStatusSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  }),
});

// ── Convert to Work Order ─────────────────────────────────

export const convertAppointmentSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    customerComplaint: z.string().max(2000).nullish(),
    mileageIn: z.coerce.number().int().min(0).nullish(),
  }),
});

// ── Available Slots Query ─────────────────────────────────

export const availableSlotsSchema = z.object({
  query: z.object({
    date: z.string().min(1, 'Date is required'),
    mechanicId: z.coerce.number().int().positive().optional(),
    duration: z.coerce.number().int().positive().default(60),
  }),
});

// ── Params ────────────────────────────────────────────────

export const appointmentIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List Query ────────────────────────────────────────────

export const appointmentListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
    customerId: z.coerce.number().int().positive().optional(),
    mechanicId: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['appointmentDate', 'status', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type AppointmentStatusInput = z.infer<typeof appointmentStatusSchema>['body'];
export type ConvertAppointmentInput = z.infer<typeof convertAppointmentSchema>['body'];
export type AvailableSlotsInput = z.infer<typeof availableSlotsSchema>['query'];
export type AppointmentListInput = z.infer<typeof appointmentListSchema>['query'];
