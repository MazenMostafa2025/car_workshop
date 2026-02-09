'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Mail, Phone, MapPin, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataTable, type Column } from '@/components/data/data-table';
import { SearchInput } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/forms';
import { CustomerForm } from '@/components/features/customer-form';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/queries/use-customers';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useConfirmation } from '@/hooks/use-confirmation';
import type { Customer } from '@/types/customer';
import type { CustomerFormData } from '@/lib/validations/customer';

function CustomersPageContent() {
  const router = useRouter();
  const pagination = usePagination({ sortBy: 'lastName', sortOrder: 'asc' });
  const debouncedSearch = useDebounce(pagination.search);

  const { data, isLoading } = useCustomers({
    ...pagination.getParams(),
    search: debouncedSearch,
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const deleteConfirmation = useConfirmation<Customer>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleCreate = (formData: CustomerFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleUpdate = (formData: CustomerFormData) => {
    if (!editingCustomer) return;
    updateMutation.mutate(
      { id: editingCustomer.id, data: formData },
      { onSuccess: () => setEditingCustomer(null) },
    );
  };

  const handleDelete = () => {
    deleteConfirmation.handleConfirm((customer) => {
      deleteMutation.mutate(customer.id);
    });
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (c) => (
        <button
          className="font-medium text-primary hover:underline"
          onClick={() => router.push(`/customers/${c.id}`)}
        >
          {c.firstName} {c.lastName}
        </button>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (c) => (
        <span className="flex items-center gap-1.5 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {c.phone}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (c) =>
        c.email ? (
          <span className="flex items-center gap-1.5 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {c.email}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'city',
      header: 'City',
      cell: (c) =>
        c.city ? (
          <span className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {c.city}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'vehicles',
      header: 'Vehicles',
      cell: (c) => <Badge variant="secondary">{c._count?.vehicles ?? 0}</Badge>,
      className: 'text-center',
    },
    {
      key: 'actions',
      header: '',
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/customers/${c.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingCustomer(c)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => deleteConfirmation.confirm(c)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={pagination.search}
          onChange={pagination.setSearch}
          placeholder="Search customers..."
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={data?.meta?.totalPages ?? 1}
        totalItems={data?.meta?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        emptyMessage="No customers found. Add your first customer to get started."
        exportFilename="customers.csv"
        exportData={(data?.data ?? []).map((c) => ({
          Name: `${c.firstName} ${c.lastName}`,
          Email: c.email || '',
          Phone: c.phone,
          City: c.city || '',
          Address: c.address || '',
          'Postal Code': c.postalCode || '',
        }))}
      />

      {/* Create Dialog */}
      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <CustomerForm
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
        onSubmit={handleUpdate}
        defaultValues={editingCustomer}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmation.open}
        onOpenChange={deleteConfirmation.setOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deleteConfirmation.item?.firstName} ${deleteConfirmation.item?.lastName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersPageContent />
    </Suspense>
  );
}
