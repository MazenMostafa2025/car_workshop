import { z } from 'zod';

// ── Create Invoice ────────────────────────────────────────

export const createInvoiceSchema = z.object({
  body: z.object({
    workOrderId: z.coerce.number().int().positive(),
    taxRate: z.coerce.number().min(0).max(100).default(0),
    discountAmount: z.coerce.number().min(0).default(0),
    notes: z.string().max(1000).nullish(),
  }),
});

// ── Update Invoice ────────────────────────────────────────

export const updateInvoiceSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    taxAmount: z.coerce.number().min(0).optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    dueDate: z.string().nullish(),
    notes: z.string().max(1000).nullish(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const invoiceIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List Query ────────────────────────────────────────────

export const invoiceListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']).optional(),
    customerId: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['invoiceDate', 'totalAmount', 'balanceDue', 'status', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>['body'];
export type InvoiceListInput = z.infer<typeof invoiceListSchema>['query'];
