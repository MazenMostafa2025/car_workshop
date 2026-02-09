'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations/appointment';
import type { Appointment } from '@/types/appointment';
import type { Customer } from '@/types/customer';
import type { Vehicle } from '@/types/customer';
import type { Employee } from '@/types/employee';

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AppointmentFormData) => void;
  defaultValues?: Appointment | null;
  customers: Customer[];
  vehicles: Vehicle[];
  mechanics: Employee[];
  isLoading?: boolean;
}

export function AppointmentForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  customers,
  vehicles,
  mechanics,
  isLoading,
}: AppointmentFormProps) {
  const isEdit = !!defaultValues;

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaultValues
      ? {
          customerId: defaultValues.customerId,
          vehicleId: defaultValues.vehicleId,
          assignedMechanicId: defaultValues.assignedMechanicId,
          serviceType: defaultValues.serviceType || '',
          scheduledDate: format(new Date(defaultValues.scheduledDate), 'yyyy-MM-dd'),
          startTime: defaultValues.startTime,
          endTime: defaultValues.endTime,
          notes: defaultValues.notes || '',
        }
      : {
          customerId: 0,
          vehicleId: null,
          assignedMechanicId: null,
          serviceType: '',
          scheduledDate: format(new Date(), 'yyyy-MM-dd'),
          startTime: '09:00',
          endTime: '10:00',
          notes: '',
        },
  });

  const selectedCustomerId = form.watch('customerId');
  const filteredVehicles = vehicles.filter((v) => v.customerId === selectedCustomerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={selectedCustomerId ? String(selectedCustomerId) : ''}
                onValueChange={(val) => {
                  form.setValue('customerId', Number(val));
                  form.setValue('vehicleId', null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customerId && (
                <p className="text-xs text-destructive">{form.formState.errors.customerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select
                value={form.watch('vehicleId') ? String(form.watch('vehicleId')) : 'none'}
                onValueChange={(val) => form.setValue('vehicleId', val === 'none' ? null : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredVehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.year} {v.make} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mechanic</Label>
              <Select
                value={form.watch('assignedMechanicId') ? String(form.watch('assignedMechanicId')) : 'none'}
                onValueChange={(val) => form.setValue('assignedMechanicId', val === 'none' ? null : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {mechanics.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Input id="serviceType" {...form.register('serviceType')} placeholder="e.g. Oil Change" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date *</Label>
              <Input id="scheduledDate" type="date" {...form.register('scheduledDate')} />
              {form.formState.errors.scheduledDate && (
                <p className="text-xs text-destructive">{form.formState.errors.scheduledDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input id="startTime" type="time" {...form.register('startTime')} />
              {form.formState.errors.startTime && (
                <p className="text-xs text-destructive">{form.formState.errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input id="endTime" type="time" {...form.register('endTime')} />
              {form.formState.errors.endTime && (
                <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update Appointment' : 'Book Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
