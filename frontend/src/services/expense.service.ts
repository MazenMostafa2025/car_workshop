import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Expense, ExpenseSummary } from "@/types/expense";

/* eslint-disable @typescript-eslint/no-explicit-any */

function num(v: any): number {
  if (typeof v === "string") return parseFloat(v) || 0;
  return v ?? 0;
}

function mapExpense(raw: any): Expense {
  return {
    ...raw,
    amount: num(raw.amount),
  };
}

export interface ExpenseListParams extends ListParams {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const expenseService = {
  list: async (
    params?: ExpenseListParams,
  ): Promise<PaginatedResponse<Expense>> => {
    const response = await apiClient.get<PaginatedResponse<any>>("/expenses", {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapExpense),
    };
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await apiClient.get<ApiResponse<any>>(`/expenses/${id}`);
    return mapExpense(response.data.data);
  },

  create: async (data: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<any>>("/expenses", data);
    return mapExpense(response.data.data);
  },

  update: async (id: number, data: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/expenses/${id}`,
      data,
    );
    return mapExpense(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  getSummary: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ExpenseSummary[]> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/expenses/summary",
      { params },
    );
    const raw = response.data.data;
    // Backend returns { grandTotal, count, categories: [...] }
    // Frontend expects ExpenseSummary[] (the categories array).
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.categories)) {
      return raw.categories.map((c: any) => ({
        category: c.category,
        total: num(c.total),
        count: c.count ?? 0,
      }));
    }
    return [];
  },
};
