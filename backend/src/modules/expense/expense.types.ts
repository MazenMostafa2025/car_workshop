// ── DTOs ──────────────────────────────────────────────────

export interface CreateExpenseDto {
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  vendor?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
}

export interface UpdateExpenseDto {
  description?: string;
  category?: string;
  amount?: number;
  expenseDate?: string;
  vendor?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
}

// ── Query Filters ─────────────────────────────────────────

export interface ExpenseListQuery {
  page?: number;
  limit?: number;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'expenseDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Summary ───────────────────────────────────────────────

export interface ExpenseSummaryQuery {
  dateFrom?: string;
  dateTo?: string;
}
