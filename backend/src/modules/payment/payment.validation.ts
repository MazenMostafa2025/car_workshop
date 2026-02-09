import { z } from 'zod';

// ── Create Payment ────────────────────────────────────────

export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.coerce.number().int().positive(),
    paymentDate: z.string().min(1, 'Payment date is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK']),
    referenceNumber: z.string().max(50).nullish(),
    notes: z.string().max(500).nullish(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const paymentIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List Query ────────────────────────────────────────────

export const paymentListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    invoiceId: z.coerce.number().int().positive().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['paymentDate', 'amount', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type PaymentListInput = z.infer<typeof paymentListSchema>['query'];
