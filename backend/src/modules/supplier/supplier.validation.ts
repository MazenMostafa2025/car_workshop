import { z } from 'zod';

// ── Shared field schemas ──────────────────────────────────

const supplierFields = {
  supplierName: z.string().min(1, 'Supplier name is required').max(100),
  contactPerson: z.string().max(100).nullish(),
  email: z.string().email('Invalid email format').max(100).nullish().or(z.literal('')),
  phone: z.string().max(20).nullish(),
  address: z.string().max(500).nullish(),
  city: z.string().max(50).nullish(),
  postalCode: z.string().max(10).nullish(),
  paymentTerms: z.string().max(100).nullish(),
  notes: z.string().max(1000).nullish(),
};

// ── Create ────────────────────────────────────────────────

export const createSupplierSchema = z.object({
  body: z.object({
    supplierName: supplierFields.supplierName,
    contactPerson: supplierFields.contactPerson,
    email: supplierFields.email,
    phone: supplierFields.phone,
    address: supplierFields.address,
    city: supplierFields.city,
    postalCode: supplierFields.postalCode,
    paymentTerms: supplierFields.paymentTerms,
    notes: supplierFields.notes,
  }),
});

// ── Update ────────────────────────────────────────────────

export const updateSupplierSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    supplierName: supplierFields.supplierName.optional(),
    contactPerson: supplierFields.contactPerson,
    email: supplierFields.email,
    phone: supplierFields.phone,
    address: supplierFields.address,
    city: supplierFields.city,
    postalCode: supplierFields.postalCode,
    paymentTerms: supplierFields.paymentTerms,
    notes: supplierFields.notes,
  }),
});

// ── Params ────────────────────────────────────────────────

export const supplierIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List / Search Query ───────────────────────────────────

export const supplierListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['supplierName', 'city', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>['body'];
export type SupplierIdInput = z.infer<typeof supplierIdSchema>['params'];
export type SupplierListInput = z.infer<typeof supplierListSchema>['query'];
