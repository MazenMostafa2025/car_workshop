import { z } from 'zod';

// ── Create Work Order ─────────────────────────────────────

export const createWorkOrderSchema = z.object({
  body: z.object({
    vehicleId: z.coerce.number().int().positive(),
    customerId: z.coerce.number().int().positive(),
    assignedMechanicId: z.coerce.number().int().positive().nullish(),
    scheduledDate: z.string().datetime({ offset: true }).nullish(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    customerComplaint: z.string().max(2000).nullish(),
    diagnosis: z.string().max(2000).nullish(),
    mileageIn: z.coerce.number().int().min(0).nullish(),
  }),
});

// ── Update Work Order ─────────────────────────────────────

export const updateWorkOrderSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    assignedMechanicId: z.coerce.number().int().positive().nullish(),
    scheduledDate: z.string().datetime({ offset: true }).nullish(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    customerComplaint: z.string().max(2000).nullish(),
    diagnosis: z.string().max(2000).nullish(),
    workPerformed: z.string().max(2000).nullish(),
    recommendations: z.string().max(2000).nullish(),
    mileageIn: z.coerce.number().int().min(0).nullish(),
    mileageOut: z.coerce.number().int().min(0).nullish(),
  }),
});

// ── Status Transition ─────────────────────────────────────

export const statusTransitionSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  }),
});

// ── Work Order Service (sub-resource) ─────────────────────

export const addServiceSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    serviceId: z.coerce.number().int().positive(),
    mechanicId: z.coerce.number().int().positive().nullish(),
    quantity: z.coerce.number().int().positive().default(1),
    unitPrice: z.coerce.number().min(0),
    laborHours: z.coerce.number().min(0).nullish(),
    notes: z.string().max(500).nullish(),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    serviceId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    mechanicId: z.coerce.number().int().positive().nullish(),
    quantity: z.coerce.number().int().positive().optional(),
    unitPrice: z.coerce.number().min(0).optional(),
    laborHours: z.coerce.number().min(0).nullish(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    notes: z.string().max(500).nullish(),
  }),
});

export const removeServiceSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    serviceId: z.coerce.number().int().positive(),
  }),
});

// ── Work Order Part (sub-resource) ────────────────────────

export const addPartSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    partId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    unitPrice: z.coerce.number().min(0),
    notes: z.string().max(500).nullish(),
  }),
});

export const updatePartSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    partId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    quantity: z.coerce.number().int().positive().optional(),
    unitPrice: z.coerce.number().min(0).optional(),
    notes: z.string().max(500).nullish(),
  }),
});

export const removePartSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    partId: z.coerce.number().int().positive(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const workOrderIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List Query ────────────────────────────────────────────

export const workOrderListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    customerId: z.coerce.number().int().positive().optional(),
    vehicleId: z.coerce.number().int().positive().optional(),
    mechanicId: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z
      .enum(['orderDate', 'scheduledDate', 'status', 'priority', 'totalCost', 'createdAt'])
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>['body'];
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>['body'];
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>['body'];
export type AddServiceInput = z.infer<typeof addServiceSchema>['body'];
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>['body'];
export type AddPartInput = z.infer<typeof addPartSchema>['body'];
export type UpdatePartInput = z.infer<typeof updatePartSchema>['body'];
export type WorkOrderListInput = z.infer<typeof workOrderListSchema>['query'];
