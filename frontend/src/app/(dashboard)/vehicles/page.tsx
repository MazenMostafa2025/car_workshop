'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Car } from 'lucide-react';
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
import { VehicleForm } from '@/components/features/vehicle-form';
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '@/queries/use-vehicles';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useConfirmation } from '@/hooks/use-confirmation';
import type { Vehicle } from '@/types/customer';
import type { VehicleFormData } from '@/lib/validations/vehicle';

function VehiclesPageContent() {
  const router = useRouter();
  const pagination = usePagination({ sortBy: 'make', sortOrder: 'asc' });
  const debouncedSearch = useDebounce(pagination.search);

  const { data, isLoading } = useVehicles({
    ...pagination.getParams(),
    search: debouncedSearch,
  });

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();
  const deleteConfirmation = useConfirmation<Vehicle>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleCreate = (data: VehicleFormData) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  };

  const handleUpdate = (data: VehicleFormData) => {
    if (!editingVehicle) return;
    updateMutation.mutate({ id: editingVehicle.id, data }, { onSuccess: () => setEditingVehicle(null) });
  };

  const handleDelete = () => {
    deleteConfirmation.handleConfirm((v) => deleteMutation.mutate(v.id));
  };

  const columns: Column<Vehicle>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (v) => (
        <button
          className="font-medium text-primary hover:underline"
          onClick={() => router.push(`/vehicles/${v.id}`)}
        >
          <span className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            {v.year} {v.make} {v.model}
          </span>
        </button>
      ),
    },
    {
      key: 'customer',
      header: 'Owner',
      cell: (v) =>
        v.customer ? (
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => router.push(`/customers/${v.customerId}`)}
          >
            {v.customer.firstName} {v.customer.lastName}
          </button>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'plate', header: 'Plate', cell: (v) => <span className="text-sm">{v.licensePlate || '—'}</span> },
    { key: 'color', header: 'Color', cell: (v) => <span className="text-sm">{v.color || '—'}</span> },
    {
      key: 'mileage',
      header: 'Mileage',
      cell: (v) => (
        <span className="text-sm">{v.mileage ? v.mileage.toLocaleString() + ' mi' : '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (v) => (
        <Badge variant={v.isActive ? 'default' : 'secondary'}>
          {v.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (v) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/vehicles/${v.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingVehicle(v)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deleteConfirmation.confirm(v)}>
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
        title="Vehicles"
        description="Manage registered vehicles"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={pagination.search}
          onChange={pagination.setSearch}
          placeholder="Search by make, model, plate..."
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
        emptyMessage="No vehicles found."
      />

      <VehicleForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} isLoading={createMutation.isPending} />
      <VehicleForm open={!!editingVehicle} onOpenChange={(open) => !open && setEditingVehicle(null)} onSubmit={handleUpdate} defaultValues={editingVehicle} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={deleteConfirmation.open} onOpenChange={deleteConfirmation.setOpen} title="Delete Vehicle" description={`Delete ${deleteConfirmation.item?.year} ${deleteConfirmation.item?.make} ${deleteConfirmation.item?.model}?`} onConfirm={handleDelete} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehiclesPageContent />
    </Suspense>
  );
}
