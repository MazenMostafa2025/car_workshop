import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Invoice, Payment } from "@/types/invoice";

/* eslint-disable @typescript-eslint/no-explicit-any */

function num(v: any): number {
  if (typeof v === "string") return parseFloat(v) || 0;
  return v ?? 0;
}

function mapPayment(raw: any): Payment {
  return {
    ...raw,
    amount: num(raw.amount),
  };
}

function mapInvoice(raw: any): Invoice {
  return {
    ...raw,
    subtotal: num(raw.subtotal),
    taxAmount: num(raw.taxAmount),
    discountAmount: num(raw.discountAmount),
    totalAmount: num(raw.totalAmount),
    amountPaid: num(raw.amountPaid),
    balanceDue: num(raw.balanceDue),
    payments: raw.payments ? raw.payments.map(mapPayment) : undefined,
  };
}

export interface InvoiceListParams extends ListParams {
  status?: string;
  customerId?: number;
}

export const invoiceService = {
  list: async (
    params?: InvoiceListParams,
  ): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get<PaginatedResponse<any>>("/invoices", {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapInvoice),
    };
  },

  getById: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<any>>(`/invoices/${id}`);
    return mapInvoice(response.data.data);
  },

  create: async (data: Partial<Invoice>): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<any>>("/invoices", data);
    return mapInvoice(response.data.data);
  },

  generateFromWorkOrder: async (
    workOrderId: number,
    data?: { taxAmount?: number; discountAmount?: number; dueDate?: string },
  ): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/invoices/generate/${workOrderId}`,
      data,
    );
    return mapInvoice(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },

  // Payments
  addPayment: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<any>>("/payments", data);
    return mapPayment(response.data.data);
  },

  listPayments: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<PaginatedResponse<any>>("/payments", {
      params,
    });
    const d = response.data;
    return {
      ...d,
      data: (d.data ?? []).map(mapPayment),
    };
  },
};
