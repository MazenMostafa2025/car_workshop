import type { Invoice, WorkOrder, Customer, Payment, InvoiceStatus } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateInvoiceDto {
  workOrderId: number;
  taxRate?: number; // percentage, e.g. 16 = 16%
  discountAmount?: number;
  notes?: string | null;
}

export interface UpdateInvoiceDto {
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string | null;
  notes?: string | null;
}

// ── Query Filters ─────────────────────────────────────────

export interface InvoiceListQuery {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'invoiceDate' | 'totalAmount' | 'balanceDue' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type InvoiceFull = Invoice & {
  workOrder: WorkOrder;
  customer: Customer;
  payments: Payment[];
};
