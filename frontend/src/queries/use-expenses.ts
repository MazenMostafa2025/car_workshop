"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  expenseService,
  type ExpenseListParams,
} from "@/services/expense.service";
import type { ExpenseFormData } from "@/lib/validations/expense";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (params?: ExpenseListParams) =>
    [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: number) => [...expenseKeys.details(), id] as const,
  summary: (params?: { dateFrom?: string; dateTo?: string }) =>
    [...expenseKeys.all, "summary", params] as const,
};

export function useExpenses(params?: ExpenseListParams) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseService.list(params),
  });
}

export function useExpenseSummary(params?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: expenseKeys.summary(params),
    queryFn: () => expenseService.getSummary(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseFormData) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.summary() });
      toast.success("Expense recorded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record expense");
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseFormData }) =>
      expenseService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: expenseKeys.summary() });
      toast.success("Expense updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.summary() });
      toast.success("Expense deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });
}
