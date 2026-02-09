import { z } from 'zod';

// ── Create ────────────────────────────────────────────────

export const createPartSchema = z.object({
  body: z.object({
    partNumber: z.string().min(1, 'Part number is required').max(50),
    partName: z.string().min(1, 'Part name is required').max(100),
    description: z.string().max(1000).nullish(),
    category: z.string().max(50).nullish(),
    manufacturer: z.string().max(100).nullish(),
    quantityInStock: z.coerce.number().int().min(0).default(0),
    reorderLevel: z.coerce.number().int().min(0).default(5),
    unitCost: z.coerce.number().min(0, 'Unit cost must be non-negative'),
    sellingPrice: z.coerce.number().min(0, 'Selling price must be non-negative'),
    supplierId: z.coerce.number().int().positive().nullish(),
    location: z.string().max(50).nullish(),
  }),
});

// ── Update ────────────────────────────────────────────────

export const updatePartSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    partName: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).nullish(),
    category: z.string().max(50).nullish(),
    manufacturer: z.string().max(100).nullish(),
    quantityInStock: z.coerce.number().int().min(0).optional(),
    reorderLevel: z.coerce.number().int().min(0).optional(),
    unitCost: z.coerce.number().min(0).optional(),
    sellingPrice: z.coerce.number().min(0).optional(),
    supplierId: z.coerce.number().int().positive().nullish(),
    location: z.string().max(50).nullish(),
    isActive: z.boolean().optional(),
  }),
});

// ── Adjust Stock ──────────────────────────────────────────

export const adjustStockSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    adjustment: z.coerce
      .number()
      .int()
      .refine((v) => v !== 0, 'Adjustment cannot be zero'),
    reason: z.string().min(1, 'Reason is required').max(255),
  }),
});

// ── Params ────────────────────────────────────────────────

export const partIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List / Search Query ───────────────────────────────────

export const partListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().max(100).optional(),
    category: z.string().max(50).optional(),
    supplierId: z.coerce.number().int().positive().optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    lowStock: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z
      .enum(['partName', 'partNumber', 'quantityInStock', 'sellingPrice', 'createdAt'])
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreatePartInput = z.infer<typeof createPartSchema>['body'];
export type UpdatePartInput = z.infer<typeof updatePartSchema>['body'];
export type AdjustStockInput = z.infer<typeof adjustStockSchema>['body'];
export type PartIdInput = z.infer<typeof partIdSchema>['params'];
export type PartListInput = z.infer<typeof partListSchema>['query'];
