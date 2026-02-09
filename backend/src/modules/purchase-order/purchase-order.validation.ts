import { z } from 'zod';

// ── Create PO with items ──────────────────────────────────

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    supplierId: z.coerce.number().int().positive(),
    orderDate: z.string().min(1, 'Order date is required'),
    expectedDeliveryDate: z.string().nullish(),
    notes: z.string().max(1000).nullish(),
    items: z
      .array(
        z.object({
          partId: z.coerce.number().int().positive(),
          quantityOrdered: z.coerce.number().int().positive(),
          unitCost: z.coerce.number().min(0),
        }),
      )
      .min(1, 'At least one item is required'),
  }),
});

// ── Update PO ─────────────────────────────────────────────

export const updatePurchaseOrderSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    expectedDeliveryDate: z.string().nullish(),
    notes: z.string().max(1000).nullish(),
  }),
});

// ── Receive PO ────────────────────────────────────────────

export const receivePurchaseOrderSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    items: z
      .array(
        z.object({
          itemId: z.coerce.number().int().positive(),
          quantityReceived: z.coerce.number().int().min(0),
        }),
      )
      .optional(),
  }),
});

// ── PO Items ──────────────────────────────────────────────

export const addPOItemSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    partId: z.coerce.number().int().positive(),
    quantityOrdered: z.coerce.number().int().positive(),
    unitCost: z.coerce.number().min(0),
  }),
});

export const updatePOItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    itemId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    quantityOrdered: z.coerce.number().int().positive().optional(),
    unitCost: z.coerce.number().min(0).optional(),
  }),
});

export const removePOItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    itemId: z.coerce.number().int().positive(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const purchaseOrderIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List Query ────────────────────────────────────────────

export const purchaseOrderListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
    supplierId: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['orderDate', 'expectedDeliveryDate', 'totalAmount', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>['body'];
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>['body'];
export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>['body'];
export type AddPOItemInput = z.infer<typeof addPOItemSchema>['body'];
export type UpdatePOItemInput = z.infer<typeof updatePOItemSchema>['body'];
export type PurchaseOrderListInput = z.infer<typeof purchaseOrderListSchema>['query'];
