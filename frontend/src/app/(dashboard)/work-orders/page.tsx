'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog, SearchInput } from '@/components/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WorkOrderForm } from '@/components/features/work-order-form';
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder, useDeleteWorkOrder } from '@/queries/use-work-orders';
import { useCustomers } from '@/queries/use-customers';
import { useVehicles } from '@/queries/use-vehicles';
import { useEmployees } from '@/queries/use-employees';
import { usePagination } from '@/hooks/use-pagination';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatCurrency, formatDate, formatStatus } from '@/lib/utils';
import { WORK_ORDER_STATUS, WORK_ORDER_PRIORITY } from '@/lib/constants';
import type { WorkOrder } from '@/types/work-order';
import type { WorkOrderFormData } from '@/lib/validations/work-order';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED': return 'default';
    case 'IN_PROGRESS': return 'secondary';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
}

function priorityVariant(priority: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'URGENT': return 'destructive';
    case 'HIGH': return 'default';
    case 'NORMAL': return 'secondary';
    default: return 'outline';
  }
}

function WorkOrdersContent() {
  const { page, pageSize, search, setSearch, setPage, getParams } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const params = {
    ...getParams(),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(priorityFilter !== 'all' && { priority: priorityFilter }),
  };

  const { data, isLoading } = useWorkOrders(params);
  const { data: customersData } = useCustomers({ limit: 200 });
  const { data: vehiclesData } = useVehicles({ limit: 500 });
  const { data: employeesData } = useEmployees({ limit: 100, role: 'MECHANIC' });

  const customers = customersData?.data ?? [];
  const vehicles = vehiclesData?.data ?? [];
  const mechanics = (employeesData?.data ?? []).filter((e) => e.role === 'MECHANIC');

  const [formOpen, setFormOpen] = useState(false);
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null);
  const deletion = useConfirmation<WorkOrder>();

  const createMutation = useCreateWorkOrder();
  const updateMutation = useUpdateWorkOrder();
  const deleteMutation = useDeleteWorkOrder();

  const handleCreate = (data: WorkOrderFormData) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  };
  const handleUpdate = (data: WorkOrderFormData) => {
    if (editingWO) {
      updateMutation.mutate({ id: editingWO.id, data }, { onSuccess: () => setEditingWO(null) });
    }
  };
  const handleDelete = () => {
    deletion.handleConfirm((wo) => {
      deleteMutation.mutate(wo.id);
    });
  };

  const columns: Column<WorkOrder>[] = [
    {
      key: 'id',
      header: 'WO #',
      cell: (wo) => (
        <Link href={`/work-orders/${wo.id}`} className="font-medium text-primary hover:underline">
          #{wo.id}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (wo) =>
        wo.customer ? `${wo.customer.firstName} ${wo.customer.lastName}` : '—',
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (wo) =>
        wo.vehicle ? `${wo.vehicle.year} ${wo.vehicle.make} ${wo.vehicle.model}` : '—',
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (wo) => (
        <Badge variant={priorityVariant(wo.priority)}>
          {formatStatus(wo.priority)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (wo) => (
        <Badge variant={statusVariant(wo.status)}>
          {formatStatus(wo.status)}
        </Badge>
      ),
    },
    {
      key: 'mechanic',
      header: 'Mechanic',
      cell: (wo) =>
        wo.assignedMechanic ? `${wo.assignedMechanic.firstName} ${wo.assignedMechanic.lastName}` : 'Unassigned',
    },
    {
      key: 'totalCost',
      header: 'Total',
      cell: (wo) => formatCurrency(wo.totalCost),
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (wo) => formatDate(wo.createdAt),
    },
    {
      key: 'actions',
      header: '',
      cell: (wo) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/work-orders/${wo.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingWO(wo)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deletion.confirm(wo)}>
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
        title="Work Orders"
        description="Track and manage repair jobs"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Work Order
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search work orders..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(WORK_ORDER_STATUS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(WORK_ORDER_PRIORITY).map(([key, { label }]) => (
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
        emptyMessage="No work orders found"
      />

      <WorkOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        customers={customers}
        vehicles={vehicles}
        mechanics={mechanics}
        isLoading={createMutation.isPending}
      />
      {editingWO && (
        <WorkOrderForm
          open={!!editingWO}
          onOpenChange={(open) => !open && setEditingWO(null)}
          onSubmit={handleUpdate}
          defaultValues={editingWO}
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          isLoading={updateMutation.isPending}
        />
      )}
      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title="Delete Work Order"
        description={`Are you sure you want to delete Work Order #${deletion.item?.id}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function WorkOrdersPage() {
  return (
    <Suspense>
      <WorkOrdersContent />
    </Suspense>
  );
}
