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
import { workOrderSchema, type WorkOrderFormData } from '@/lib/validations/work-order';
import type { WorkOrder } from '@/types/work-order';
import type { Customer } from '@/types/customer';
import type { Vehicle } from '@/types/customer';
import type { Employee } from '@/types/employee';

interface WorkOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WorkOrderFormData) => void;
  defaultValues?: WorkOrder | null;
  customers: Customer[];
  vehicles: Vehicle[];
  mechanics: Employee[];
  isLoading?: boolean;
}

export function WorkOrderForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  customers,
  vehicles,
  mechanics,
  isLoading,
}: WorkOrderFormProps) {
  const isEdit = !!defaultValues;

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: defaultValues
      ? {
          customerId: defaultValues.customerId,
          vehicleId: defaultValues.vehicleId,
          assignedMechanicId: defaultValues.assignedMechanicId,
          priority: defaultValues.priority,
          description: defaultValues.description || '',
          diagnosis: defaultValues.diagnosis || '',
          estimatedCompletionDate: defaultValues.estimatedCompletionDate
            ? format(new Date(defaultValues.estimatedCompletionDate), 'yyyy-MM-dd')
            : '',
          notes: defaultValues.notes || '',
        }
      : {
          customerId: 0,
          vehicleId: 0,
          assignedMechanicId: null,
          priority: 'NORMAL',
          description: '',
          diagnosis: '',
          estimatedCompletionDate: '',
          notes: '',
        },
  });

  const selectedCustomerId = form.watch('customerId');
  const filteredVehicles = vehicles.filter((v) => v.customerId === selectedCustomerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Work Order' : 'New Work Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={selectedCustomerId ? String(selectedCustomerId) : ''}
                onValueChange={(val) => {
                  form.setValue('customerId', Number(val));
                  form.setValue('vehicleId', 0);
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
              <Label>Vehicle *</Label>
              <Select
                value={form.watch('vehicleId') ? String(form.watch('vehicleId')) : ''}
                onValueChange={(val) => form.setValue('vehicleId', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.year} {v.make} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.vehicleId && (
                <p className="text-xs text-destructive">{form.formState.errors.vehicleId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(val) => form.setValue('priority', val as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned Mechanic</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedCompletionDate">Estimated Completion</Label>
            <Input id="estimatedCompletionDate" type="date" {...form.register('estimatedCompletionDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register('description')} placeholder="Customer complaint / job description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea id="diagnosis" rows={2} {...form.register('diagnosis')} placeholder="Mechanic's diagnosis" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...form.register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
