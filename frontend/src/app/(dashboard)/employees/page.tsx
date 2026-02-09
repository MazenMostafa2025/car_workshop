'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataTable, type Column } from '@/components/data/data-table';
import { SearchInput, ConfirmDialog } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmployeeForm } from '@/components/features/employee-form';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/queries/use-employees';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useConfirmation } from '@/hooks/use-confirmation';
import { EMPLOYEE_ROLE } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types/employee';
import type { EmployeeFormData } from '@/lib/validations/employee';

function EmployeesPageContent() {
  const router = useRouter();
  const pagination = usePagination({ sortBy: 'lastName', sortOrder: 'asc' });
  const debouncedSearch = useDebounce(pagination.search);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data, isLoading } = useEmployees({
    ...pagination.getParams(),
    search: debouncedSearch,
    ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
  });

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const deleteConfirmation = useConfirmation<Employee>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleCreate = (formData: EmployeeFormData) => {
    createMutation.mutate(formData, { onSuccess: () => setFormOpen(false) });
  };

  const handleUpdate = (formData: EmployeeFormData) => {
    if (!editingEmployee) return;
    updateMutation.mutate(
      { id: editingEmployee.id, data: formData },
      { onSuccess: () => setEditingEmployee(null) },
    );
  };

  const handleDelete = () => {
    deleteConfirmation.handleConfirm((emp) => deleteMutation.mutate(emp.id));
  };

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (e) => (
        <button
          className="font-medium text-primary hover:underline"
          onClick={() => router.push(`/employees/${e.id}`)}
        >
          {e.firstName} {e.lastName}
        </button>
      ),
    },
    { key: 'email', header: 'Email', cell: (e) => <span className="text-sm">{e.email}</span> },
    {
      key: 'role',
      header: 'Role',
      cell: (e) => (
        <Badge variant="outline">
          {EMPLOYEE_ROLE[e.role as keyof typeof EMPLOYEE_ROLE]?.label ?? e.role}
        </Badge>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      cell: (e) => <span className="text-sm">{e.specialization || '—'}</span>,
    },
    {
      key: 'hourlyRate',
      header: 'Rate',
      cell: (e) => <span className="text-sm">{e.hourlyRate ? formatCurrency(e.hourlyRate) + '/hr' : '—'}</span>,
    },
    {
      key: 'hireDate',
      header: 'Hired',
      cell: (e) => <span className="text-sm">{formatDate(e.hireDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (e) => (
        <Badge variant={e.isActive ? 'default' : 'secondary'}>
          {e.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (e) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/employees/${e.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingEmployee(e)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => deleteConfirmation.confirm(e)}>
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
        title="Employees"
        description="Manage staff and mechanics"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={pagination.search}
          onChange={pagination.setSearch}
          placeholder="Search employees..."
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(EMPLOYEE_ROLE).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        emptyMessage="No employees found."
      />

      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} isLoading={createMutation.isPending} />
      <EmployeeForm open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)} onSubmit={handleUpdate} defaultValues={editingEmployee} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={deleteConfirmation.open} onOpenChange={deleteConfirmation.setOpen} title="Delete Employee" description={`Delete ${deleteConfirmation.item?.firstName} ${deleteConfirmation.item?.lastName}?`} onConfirm={handleDelete} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense>
      <EmployeesPageContent />
    </Suspense>
  );
}
