'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormData } from '@/lib/validations/employee';
import type { Employee } from '@/types/employee';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EMPLOYEE_ROLE } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EmployeeFormData) => void;
  defaultValues?: Employee | null;
  isLoading?: boolean;
}

export function EmployeeForm({ open, onOpenChange, onSubmit, defaultValues, isLoading }: EmployeeFormProps) {
  const isEdit = !!defaultValues;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: defaultValues
      ? {
          firstName: defaultValues.firstName,
          lastName: defaultValues.lastName,
          email: defaultValues.email,
          phone: defaultValues.phone || '',
          role: defaultValues.role,
          specialization: defaultValues.specialization || '',
          hireDate: format(new Date(defaultValues.hireDate), 'yyyy-MM-dd'),
          hourlyRate: defaultValues.hourlyRate ?? undefined,
          password: '',
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'MECHANIC' as const,
          specialization: '',
          hireDate: format(new Date(), 'yyyy-MM-dd'),
          hourlyRate: undefined,
          password: '',
        },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Employee' : 'New Employee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(value) => form.setValue('role', value as EmployeeFormData['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYEE_ROLE).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" {...form.register('specialization')} placeholder="e.g. Engine, Brakes" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date *</Label>
              <Input id="hireDate" type="date" {...form.register('hireDate')} />
              {form.formState.errors.hireDate && (
                <p className="text-xs text-destructive">{form.formState.errors.hireDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input id="hourlyRate" type="number" step="0.01" {...form.register('hourlyRate', { valueAsNumber: true })} />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
