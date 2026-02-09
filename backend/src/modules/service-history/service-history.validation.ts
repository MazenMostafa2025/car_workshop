import { z } from 'zod';

// ── List Service History ──────────────────────────────────

export const serviceHistoryListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    vehicleId: z.coerce.number().int().positive().optional(),
    customerId: z.coerce.number().int().positive().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['createdAt', 'completedDate', 'totalAmount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Vehicle ID Param ──────────────────────────────────────

export const vehicleIdSchema = z.object({
  params: z.object({ vehicleId: z.coerce.number().int().positive() }),
});

// ── Vehicle History Query ─────────────────────────────────

export const vehicleHistorySchema = z.object({
  params: z.object({ vehicleId: z.coerce.number().int().positive() }),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type ServiceHistoryListInput = z.infer<typeof serviceHistoryListSchema>['query'];
export type VehicleHistoryInput = z.infer<typeof vehicleHistorySchema>;
