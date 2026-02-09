import { z } from 'zod';

// ── Shared field schemas ──────────────────────────────────

const customerFields = {
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Must be a valid email').max(100).nullish(),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().max(500).nullish(),
  city: z.string().max(50).nullish(),
  postalCode: z.string().max(10).nullish(),
  notes: z.string().max(1000).nullish(),
};

// ── Create ────────────────────────────────────────────────

export const createCustomerSchema = z.object({
  body: z.object({
    firstName: customerFields.firstName,
    lastName: customerFields.lastName,
    email: customerFields.email,
    phone: customerFields.phone,
    address: customerFields.address,
    city: customerFields.city,
    postalCode: customerFields.postalCode,
    notes: customerFields.notes,
  }),
});

// ── Update ────────────────────────────────────────────────

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    firstName: customerFields.firstName.optional(),
    lastName: customerFields.lastName.optional(),
    email: customerFields.email,
    phone: customerFields.phone.optional(),
    address: customerFields.address,
    city: customerFields.city,
    postalCode: customerFields.postalCode,
    notes: customerFields.notes,
    isActive: z.boolean().optional(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const customerIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

// ── List / Search Query ───────────────────────────────────

export const customerListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().max(100).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z.enum(['firstName', 'lastName', 'dateRegistered', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body'];
export type CustomerIdInput = z.infer<typeof customerIdSchema>['params'];
export type CustomerListInput = z.infer<typeof customerListSchema>['query'];
