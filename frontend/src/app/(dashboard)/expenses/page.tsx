'use client';

import { Suspense, useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, DollarSign, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog, SearchInput } from '@/components/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExpenseForm } from '@/components/features/expense-form';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, useExpenseSummary } from '@/queries/use-expenses';
import { usePagination } from '@/hooks/use-pagination';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';
import { EXPENSE_CATEGORY } from '@/lib/constants';
import type { Expense } from '@/types/expense';
import type { ExpenseFormData } from '@/lib/validations/expense';

function ExpensesContent() {
  const { page, pageSize, search, setSearch, setPage, getParams } = usePagination();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const params = {
    ...getParams(),
    ...(categoryFilter !== 'all' && { category: categoryFilter }),
  };

  const { data, isLoading } = useExpenses(params);
  const { data: summaryData } = useExpenseSummary();

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const deletion = useConfirmation<Expense>();

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const handleCreate = (data: ExpenseFormData) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  };
  const handleUpdate = (data: ExpenseFormData) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data }, { onSuccess: () => setEditingExpense(null) });
    }
  };
  const handleDelete = () => {
    deletion.handleConfirm((exp) => deleteMutation.mutate(exp.id));
  };

  const totalExpenses = summaryData?.reduce((sum, s) => sum + s.total, 0) ?? 0;

  const columns: Column<Expense>[] = [
    {
      key: 'expenseDate',
      header: 'Date',
      cell: (exp) => formatDate(exp.expenseDate),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (exp) => (
        <Badge variant="outline">{formatStatus(exp.category)}</Badge>
      ),
    },
    { key: 'vendor', header: 'Vendor', cell: (exp) => exp.vendor || '—' },
    { key: 'description', header: 'Description', cell: (exp) => exp.description || '—' },
    {
      key: 'amount',
      header: 'Amount',
      cell: (exp) => <span className="font-medium">{formatCurrency(exp.amount)}</span>,
    },
    { key: 'reference', header: 'Reference', cell: (exp) => exp.reference || '—' },
    {
      key: 'recordedBy',
      header: 'Recorded By',
      cell: (exp) => exp.recordedBy ? `${exp.recordedBy.firstName} ${exp.recordedBy.lastName}` : '—',
    },
    {
      key: 'actions',
      header: '',
      cell: (exp) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingExpense(exp)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deletion.confirm(exp)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track workshop expenses"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{summaryData?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      {summaryData && summaryData.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summaryData.map((s) => (
            <Badge key={s.category} variant="outline" className="text-sm py-1 px-3">
              {formatStatus(s.category)}: {formatCurrency(s.total)} ({s.count})
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(EXPENSE_CATEGORY).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.meta?.totalPages ?? 1}
        totalItems={data?.meta?.total ?? 0}
        onPageChange={setPage}
        emptyMessage="No expenses found"
      />

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
      {editingExpense && (
        <ExpenseForm
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onSubmit={handleUpdate}
          defaultValues={editingExpense}
          isLoading={updateMutation.isPending}
        />
      )}
      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesContent />
    </Suspense>
  );
}
