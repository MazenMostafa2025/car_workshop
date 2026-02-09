import { z } from 'zod';

// ── Shared field schemas ──────────────────────────────────

const employeeFields = {
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Must be a valid email').max(100).nullish(),
  phone: z.string().max(20).nullish(),
  role: z.string().min(1, 'Role is required').max(50),
  specialization: z.string().max(100).nullish(),
  hireDate: z.coerce.date({ required_error: 'Hire date is required' }),
  hourlyRate: z.coerce.number().positive('Hourly rate must be positive').nullish(),
};

// ── Create ────────────────────────────────────────────────

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: employeeFields.firstName,
    lastName: employeeFields.lastName,
    email: employeeFields.email,
    phone: employeeFields.phone,
    role: employeeFields.role,
    specialization: employeeFields.specialization,
    hireDate: employeeFields.hireDate,
    hourlyRate: employeeFields.hourlyRate,
  }),
});

// ── Update ────────────────────────────────────────────────

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    firstName: employeeFields.firstName.optional(),
    lastName: employeeFields.lastName.optional(),
    email: employeeFields.email,
    phone: employeeFields.phone,
    role: employeeFields.role.optional(),
    specialization: employeeFields.specialization,
    hireDate: employeeFields.hireDate.optional(),
    hourlyRate: employeeFields.hourlyRate,
    isActive: z.boolean().optional(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const employeeIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

// ── List / Filter Query ───────────────────────────────────

export const employeeListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().max(100).optional(),
    role: z.string().max(50).optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z.enum(['firstName', 'lastName', 'hireDate', 'role', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type EmployeeIdInput = z.infer<typeof employeeIdSchema>['params'];
export type EmployeeListInput = z.infer<typeof employeeListSchema>['query'];
