import type { Payment, Invoice, PaymentMethod } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreatePaymentDto {
  invoiceId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

// ── Query Filters ─────────────────────────────────────────

export interface PaymentListQuery {
  page?: number;
  limit?: number;
  invoiceId?: number;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'paymentDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type PaymentWithInvoice = Payment & {
  invoice: Invoice;
};
