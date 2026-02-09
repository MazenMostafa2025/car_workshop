'use client';

import { Suspense, useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog, SearchInput } from '@/components/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AppointmentForm } from '@/components/features/appointment-form';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  useConvertToWorkOrder,
} from '@/queries/use-appointments';
import { useCustomers } from '@/queries/use-customers';
import { useVehicles } from '@/queries/use-vehicles';
import { useEmployees } from '@/queries/use-employees';
import { usePagination } from '@/hooks/use-pagination';
import { useConfirmation } from '@/hooks/use-confirmation';
import { formatStatus } from '@/lib/utils';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import type { Appointment } from '@/types/appointment';
import type { AppointmentFormData } from '@/lib/validations/appointment';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED': return 'default';
    case 'IN_PROGRESS': return 'secondary';
    case 'CANCELLED':
    case 'NO_SHOW': return 'destructive';
    default: return 'outline';
  }
}

function AppointmentsContent() {
  const router = useRouter();
  const { page, pageSize, search, setSearch, setPage, getParams } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const params = {
    ...getParams(),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, isLoading } = useAppointments(params);
  const { data: customersData } = useCustomers({ limit: 200 });
  const { data: vehiclesData } = useVehicles({ limit: 500 });
  const { data: employeesData } = useEmployees({ limit: 100, role: 'MECHANIC' });

  const customers = customersData?.data ?? [];
  const vehicles = vehiclesData?.data ?? [];
  const mechanics = (employeesData?.data ?? []).filter((e) => e.role === 'MECHANIC');

  const [formOpen, setFormOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const deletion = useConfirmation<Appointment>();

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();
  const convertMutation = useConvertToWorkOrder();

  const handleCreate = (data: AppointmentFormData) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  };
  const handleUpdate = (data: AppointmentFormData) => {
    if (editingAppt) {
      updateMutation.mutate({ id: editingAppt.id, data }, { onSuccess: () => setEditingAppt(null) });
    }
  };
  const handleDelete = () => {
    deletion.handleConfirm((appt) => {
      deleteMutation.mutate(appt.id);
    });
  };
  const handleConvert = (id: number) => {
    convertMutation.mutate(id, {
      onSuccess: (data) => {
        router.push(`/work-orders/${data.workOrderId}`);
      },
    });
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'scheduledDate',
      header: 'Date & Time',
      cell: (a) => (
        <div>
          <p className="font-medium">{format(new Date(a.scheduledDate), 'MMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">{a.startTime} — {a.endTime}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (a) =>
        a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : '—',
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (a) =>
        a.vehicle ? `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}` : '—',
    },
    { key: 'serviceType', header: 'Service', cell: (a) => a.serviceType || '—' },
    {
      key: 'mechanic',
      header: 'Mechanic',
      cell: (a) =>
        a.assignedMechanic ? `${a.assignedMechanic.firstName} ${a.assignedMechanic.lastName}` : 'Unassigned',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (a) => (
        <Badge variant={statusVariant(a.status)}>
          {formatStatus(a.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (appt) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingAppt(appt)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED' ? (
              <DropdownMenuItem onClick={() => handleConvert(appt.id)}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert to Work Order
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="text-destructive" onClick={() => deletion.confirm(appt)}>
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
        title="Appointments"
        description="Schedule and manage customer appointments"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search appointments..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(APPOINTMENT_STATUS).map(([key, { label }]) => (
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
        emptyMessage="No appointments found"
      />

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        customers={customers}
        vehicles={vehicles}
        mechanics={mechanics}
        isLoading={createMutation.isPending}
      />
      {editingAppt && (
        <AppointmentForm
          open={!!editingAppt}
          onOpenChange={(open) => !open && setEditingAppt(null)}
          onSubmit={handleUpdate}
          defaultValues={editingAppt}
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          isLoading={updateMutation.isPending}
        />
      )}
      <ConfirmDialog
        open={deletion.open}
        onOpenChange={deletion.setOpen}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense>
      <AppointmentsContent />
    </Suspense>
  );
}
