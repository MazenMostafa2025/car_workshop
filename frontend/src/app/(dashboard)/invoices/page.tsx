'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Eye, Trash2, MoreHorizontal, DollarSign, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog, SearchInput } from '@/components/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaymentForm } from '@/components/features/payment-form';
import { useInvoices, useDeleteInvoice, useAddPayment } from '@/queries/use-invoices';
import { usePagination } from '@/hooks/use-pagination';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';
import { INVOICE_STATUS } from '@/lib/constants';
import type { Invoice } from '@/types/invoice';
import type { PaymentFormData } from '@/lib/validations/invoice';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PAID': return 'default';
    case 'PARTIALLY_PAID': return 'secondary';
    case 'OVERDUE': return 'destructive';
    default: return 'outline';
  }
}

function InvoicesContent() {
  const { page, pageSize, search, setSearch, setPage, getParams } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const params = {
    ...getParams(),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, isLoading } = useInvoices(params);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const deletion = useConfirmation<Invoice>();

  const deleteMutation = useDeleteInvoice();
  const paymentMutation = useAddPayment();

  const handleDelete = () => {
    deletion.handleConfirm((inv) => deleteMutation.mutate(inv.id));
  };

  const handlePayment = (data: PaymentFormData) => {
    paymentMutation.mutate(data, { onSuccess: () => setPayingInvoice(null) });
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      cell: (inv) => (
        <Link href={`/invoices/${inv.id}`} className="font-medium text-primary hover:underline">
          {inv.invoiceNumber}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (inv) => inv.customer ? `${inv.customer.firstName} ${inv.customer.lastName}` : '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (inv) => (
        <Badge variant={statusVariant(inv.status)}>
          {formatStatus(inv.status)}
        </Badge>
      ),
    },
    { key: 'totalAmount', header: 'Total', cell: (inv) => formatCurrency(inv.totalAmount) },
    { key: 'amountPaid', header: 'Paid', cell: (inv) => formatCurrency(inv.amountPaid) },
    {
      key: 'balanceDue',
      header: 'Balance',
      cell: (inv) => (
        <span className={inv.balanceDue > 0 ? 'text-destructive font-semibold' : 'text-green-600'}>
          {formatCurrency(inv.balanceDue)}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Date', cell: (inv) => formatDate(inv.createdAt) },
    {
      key: 'actions',
      header: '',
      cell: (inv) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${inv.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            {inv.balanceDue > 0 && (
              <DropdownMenuItem onClick={() => setPayingInvoice(inv)}>
                <DollarSign className="mr-2 h-4 w-4" /> Record Payment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => deletion.confirm(inv)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Summary
  const invoices = data?.data ?? [];
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Billing and payment tracking"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{data?.meta.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(INVOICE_STATUS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.meta?.totalPages ?? 1}
        totalItems={data?.meta?.total ?? 0}
        onPageChange={setPage}
        emptyMessage="No invoices found"
      />

      {payingInvoice && (
        <PaymentForm
          open={!!payingInvoice}
          onOpenChange={(open) => !open && setPayingInvoice(null)}
          onSubmit={handlePayment}
          invoiceId={payingInvoice.id}
          balanceDue={payingInvoice.balanceDue}
          isLoading={paymentMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title="Delete Invoice"
        description={`Delete invoice ${deletion.item?.invoiceNumber}? This cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}
