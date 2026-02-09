"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  invoiceService,
  type InvoiceListParams,
} from "@/services/invoice.service";
import type { PaymentFormData } from "@/lib/validations/invoice";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params?: InvoiceListParams) =>
    [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
  payments: () => ["payments"] as const,
};

export function useInvoices(params?: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoiceService.list(params),
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workOrderId,
      data,
    }: {
      workOrderId: number;
      data?: { taxAmount?: number; discountAmount?: number; dueDate?: string };
    }) => invoiceService.generateFromWorkOrder(workOrderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      toast.success("Invoice generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate invoice");
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => invoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      toast.success("Invoice deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete invoice");
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentFormData) => invoiceService.addPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.payments() });
      toast.success("Payment recorded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });
}
