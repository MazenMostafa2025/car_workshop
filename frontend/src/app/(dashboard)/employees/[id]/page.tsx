'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Mail, Phone, Clock, DollarSign, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { EmployeeForm } from '@/components/features/employee-form';
import { ConfirmDialog } from '@/components/forms';
import { useEmployee, useUpdateEmployee, useDeleteEmployee } from '@/queries/use-employees';
import { formatDate, formatCurrency } from '@/lib/utils';
import { EMPLOYEE_ROLE } from '@/lib/constants';
import type { EmployeeFormData } from '@/lib/validations/employee';

function EmployeeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: employee, isLoading } = useEmployee(id);
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdate = (data: EmployeeFormData) => {
    updateMutation.mutate({ id, data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, { onSuccess: () => router.push('/employees') });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/employees')}>
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={`${EMPLOYEE_ROLE[employee.role as keyof typeof EMPLOYEE_ROLE]?.label ?? employee.role} · Hired ${formatDate(employee.hireDate)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/employees')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact & Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.phone}</span>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Role</p>
                <Badge variant="outline" className="mt-1">
                  {EMPLOYEE_ROLE[employee.role as keyof typeof EMPLOYEE_ROLE]?.label ?? employee.role}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={employee.isActive ? 'default' : 'secondary'} className="mt-1">
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {employee.specialization && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Specialization</p>
                  <p className="mt-1">{employee.specialization}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  <p className="text-sm font-medium">
                    {employee.hourlyRate ? formatCurrency(employee.hourlyRate) : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Work Orders</p>
                  <p className="text-sm font-medium">{employee._count?.workOrdersAsMechanic ?? 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EmployeeForm open={editOpen} onOpenChange={setEditOpen} onSubmit={handleUpdate} defaultValues={employee} isLoading={updateMutation.isPending} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Employee" description={`Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`} onConfirm={handleDelete} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}

export default function EmployeeDetailPage() {
  return (
    <Suspense>
      <EmployeeDetailContent />
    </Suspense>
  );
}
