import { z } from 'zod';

// ══════════════════════════════════════════════
// CATEGORY SCHEMAS
// ══════════════════════════════════════════════

export const createCategorySchema = z.object({
  body: z.object({
    categoryName: z.string().min(1, 'Category name is required').max(100),
    description: z.string().max(500).nullish(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    categoryName: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullish(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ══════════════════════════════════════════════
// SERVICE SCHEMAS
// ══════════════════════════════════════════════

const serviceFields = {
  categoryId: z.coerce.number().int().positive().nullish(),
  serviceName: z.string().min(1, 'Service name is required').max(100),
  description: z.string().max(500).nullish(),
  estimatedDuration: z.coerce.number().int().positive('Duration must be positive').nullish(),
  basePrice: z.coerce.number().positive('Base price must be positive'),
};

export const createServiceSchema = z.object({
  body: z.object({
    categoryId: serviceFields.categoryId,
    serviceName: serviceFields.serviceName,
    description: serviceFields.description,
    estimatedDuration: serviceFields.estimatedDuration,
    basePrice: serviceFields.basePrice,
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    categoryId: serviceFields.categoryId,
    serviceName: serviceFields.serviceName.optional(),
    description: serviceFields.description,
    estimatedDuration: serviceFields.estimatedDuration,
    basePrice: serviceFields.basePrice.optional(),
    isActive: z.boolean().optional(),
  }),
});

export const serviceIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

export const serviceListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().max(100).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z.enum(['serviceName', 'basePrice', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type CreateServiceInput = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>['body'];
export type ServiceListInput = z.infer<typeof serviceListSchema>['query'];
