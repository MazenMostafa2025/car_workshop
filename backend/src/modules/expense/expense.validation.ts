import { z } from 'zod';

// ── Create Expense ────────────────────────────────────────

export const createExpenseSchema = z.object({
  body: z.object({
    description: z.string().min(1, 'Description is required').max(255),
    category: z.enum([
      'RENT',
      'UTILITIES',
      'SALARIES',
      'PARTS_PURCHASE',
      'EQUIPMENT',
      'MARKETING',
      'INSURANCE',
      'MAINTENANCE',
      'OTHER',
    ]),
    amount: z.coerce.number().positive('Amount must be positive'),
    expenseDate: z.string().min(1, 'Expense date is required'),
    vendor: z.string().max(100).nullish(),
    receiptNumber: z.string().max(50).nullish(),
    notes: z.string().max(500).nullish(),
  }),
});

// ── Update Expense ────────────────────────────────────────

export const updateExpenseSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    description: z.string().min(1).max(255).optional(),
    category: z
      .enum([
        'RENT',
        'UTILITIES',
        'SALARIES',
        'PARTS_PURCHASE',
        'EQUIPMENT',
        'MARKETING',
        'INSURANCE',
        'MAINTENANCE',
        'OTHER',
      ])
      .optional(),
    amount: z.coerce.number().positive().optional(),
    expenseDate: z.string().optional(),
    vendor: z.string().max(100).nullish(),
    receiptNumber: z.string().max(50).nullish(),
    notes: z.string().max(500).nullish(),
  }),
});

// ── Params ────────────────────────────────────────────────

export const expenseIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

// ── List Query ────────────────────────────────────────────

export const expenseListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    category: z
      .enum([
        'RENT',
        'UTILITIES',
        'SALARIES',
        'PARTS_PURCHASE',
        'EQUIPMENT',
        'MARKETING',
        'INSURANCE',
        'MAINTENANCE',
        'OTHER',
      ])
      .optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['expenseDate', 'amount', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// ── Summary Query ─────────────────────────────────────────

export const expenseSummarySchema = z.object({
  query: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>['body'];
export type ExpenseListInput = z.infer<typeof expenseListSchema>['query'];
export type ExpenseSummaryInput = z.infer<typeof expenseSummarySchema>['query'];
