import { z } from "zod";

export const invoiceSchema = z.object({
  workOrderId: z.number().min(1, "Work order is required"),
  customerId: z.number().min(1, "Customer is required"),
  taxAmount: z.number().min(0),
  discountAmount: z.number().min(0),
  dueDate: z.string(),
  notes: z.string().max(500),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  invoiceId: z.number().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentDate: z.string().min(1, "Date is required"),
  reference: z.string().max(100),
  notes: z.string().max(500),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
