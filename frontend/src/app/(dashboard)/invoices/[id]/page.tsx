'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, FileText, Printer } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentForm } from '@/components/features/payment-form';
import { useInvoice, useAddPayment } from '@/queries/use-invoices';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';
import type { PaymentFormData } from '@/lib/validations/invoice';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PAID': return 'default';
    case 'PARTIALLY_PAID': return 'secondary';
    case 'OVERDUE': return 'destructive';
    default: return 'outline';
  }
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const invoiceId = parseInt(id);
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const paymentMutation = useAddPayment();
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-48" /></div>;
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Invoice not found</h2>
        <Button asChild className="mt-4"><Link href="/invoices">Back</Link></Button>
      </div>
    );
  }

  const handlePayment = (data: PaymentFormData) => {
    paymentMutation.mutate(data, { onSuccess: () => setPaymentOpen(false) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={invoice.customer ? `${invoice.customer.firstName} ${invoice.customer.lastName}` : undefined}
        actions={
          <div className="flex gap-2">
            {invoice.balanceDue > 0 && (
              <Button onClick={() => setPaymentOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()} className="no-print">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" asChild>
              <Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariant(invoice.status)}>{formatStatus(invoice.status)}</Badge>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(invoice.createdAt)}</span></div>
            {invoice.dueDate && (
              <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{formatDate(invoice.dueDate)}</span></div>
            )}
            {invoice.workOrder && (
              <div className="flex justify-between"><span className="text-muted-foreground">Work Order</span>
                <Link href={`/work-orders/${invoice.workOrderId}`} className="text-primary hover:underline">#{invoice.workOrderId}</Link>
              </div>
            )}
            {invoice.notes && <><Separator /><p>{invoice.notes}</p></>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Amounts</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-{formatCurrency(invoice.discountAmount)}</span></div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatCurrency(invoice.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-green-600">{formatCurrency(invoice.amountPaid)}</span></div>
            <div className="flex justify-between font-semibold">
              <span>Balance Due</span>
              <span className={invoice.balanceDue > 0 ? 'text-destructive' : 'text-green-600'}>{formatCurrency(invoice.balanceDue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments */}
      <Card>
        <CardHeader><CardTitle>Payment History ({invoice.payments?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatStatus(payment.paymentMethod)} • {formatDate(payment.paymentDate)}
                    </p>
                    {payment.reference && <p className="text-sm text-muted-foreground">Ref: {payment.reference}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>

      {paymentOpen && (
        <PaymentForm
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          onSubmit={handlePayment}
          invoiceId={invoice.id}
          balanceDue={invoice.balanceDue}
          isLoading={paymentMutation.isPending}
        />
      )}
    </div>
  );
}
