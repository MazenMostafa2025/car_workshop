export interface Expense {
  id: number;
  category: string;
  amount: number;
  vendor: string | null;
  description: string | null;
  expenseDate: string;
  reference: string | null;
  recordedById: number | null;
  createdAt: string;
  updatedAt: string;
  recordedBy?: { id: number; firstName: string; lastName: string };
}

export interface ExpenseSummary {
  category: string;
  total: number;
  count: number;
}
