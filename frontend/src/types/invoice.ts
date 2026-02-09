export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  workOrderId: number;
  customerId: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: number; firstName: string; lastName: string };
  workOrder?: { id: number; description: string | null };
  payments?: Payment[];
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  invoice?: { id: number; invoiceNumber: string; customerId: number };
}
