'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataTable, type Column } from '@/components/data/data-table';
import { SearchInput, ConfirmDialog } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupplierForm } from '@/components/features/supplier-form';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/queries/use-suppliers';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useConfirmation } from '@/hooks/use-confirmation';
import type { Supplier } from '@/types/supplier';
import type { SupplierFormData } from '@/lib/validations/supplier';

function SuppliersPageContent() {
  const router = useRouter();
  const pagination = usePagination({ sortBy: 'name', sortOrder: 'asc' });
  const debouncedSearch = useDebounce(pagination.search);

  const { data, isLoading } = useSuppliers({
    ...pagination.getParams(),
    search: debouncedSearch,
  });

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  const deleteConfirmation = useConfirmation<Supplier>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleCreate = (data: SupplierFormData) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  };

  const handleUpdate = (data: SupplierFormData) => {
    if (!editingSupplier) return;
    updateMutation.mutate({ id: editingSupplier.id, data }, { onSuccess: () => setEditingSupplier(null) });
  };

  const handleDelete = () => {
    deleteConfirmation.handleConfirm((s) => deleteMutation.mutate(s.id));
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier',
      cell: (s) => (
        <button className="font-medium text-primary hover:underline" onClick={() => router.push(`/suppliers/${s.id}`)}>
          {s.name}
        </button>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (s) => <span className="text-sm">{s.contactPerson || '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (s) =>
        s.phone ? (
          <span className="flex items-center gap-1.5 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {s.phone}
          </span>
        ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (s) =>
        s.email ? (
          <span className="flex items-center gap-1.5 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {s.email}
          </span>
        ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'city',
      header: 'City',
      cell: (s) =>
        s.city ? (
          <span className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {s.city}
          </span>
        ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'parts',
      header: 'Parts',
      cell: (s) => <Badge variant="secondary">{s._count?.parts ?? 0}</Badge>,
      className: 'text-center',
    },
    {
      key: 'actions',
      header: '',
      cell: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/suppliers/${s.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingSupplier(s)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deleteConfirmation.confirm(s)}>
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
        title="Suppliers"
        description="Manage your parts suppliers"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={pagination.search}
          onChange={pagination.setSearch}
          placeholder="Search suppliers..."
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
        emptyMessage="No suppliers found."
      />

      <SupplierForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} isLoading={createMutation.isPending} />
      <SupplierForm open={!!editingSupplier} onOpenChange={(open) => !open && setEditingSupplier(null)} onSubmit={handleUpdate} defaultValues={editingSupplier} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={deleteConfirmation.open} onOpenChange={deleteConfirmation.setOpen} title="Delete Supplier" description={`Delete "${deleteConfirmation.item?.name}"?`} onConfirm={handleDelete} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense>
      <SuppliersPageContent />
    </Suspense>
  );
}
