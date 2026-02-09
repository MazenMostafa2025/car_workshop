'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, type VehicleFormData } from '@/lib/validations/vehicle';
import type { Vehicle } from '@/types/customer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useCustomers } from '@/queries/use-customers';

interface VehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormData) => void;
  defaultValues?: Vehicle | null;
  preselectedCustomerId?: number;
  isLoading?: boolean;
}

export function VehicleForm({ open, onOpenChange, onSubmit, defaultValues, preselectedCustomerId, isLoading }: VehicleFormProps) {
  const isEdit = !!defaultValues;
  const { data: customersData } = useCustomers({ limit: 200 });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: defaultValues
      ? {
          customerId: defaultValues.customerId,
          make: defaultValues.make,
          model: defaultValues.model,
          year: defaultValues.year,
          vin: defaultValues.vin || '',
          licensePlate: defaultValues.licensePlate || '',
          color: defaultValues.color || '',
          mileage: defaultValues.mileage ?? undefined,
          engineType: defaultValues.engineType || '',
          transmissionType: defaultValues.transmissionType || '',
        }
      : {
          customerId: preselectedCustomerId || 0,
          make: '',
          model: '',
          year: new Date().getFullYear(),
          vin: '',
          licensePlate: '',
          color: '',
          mileage: undefined,
          engineType: '',
          transmissionType: '',
        },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Vehicle' : 'New Vehicle'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer *</Label>
            <Select
              value={String(form.watch('customerId') || '')}
              onValueChange={(val) => form.setValue('customerId', Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customersData?.data?.map((c) => (
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input id="make" {...form.register('make')} placeholder="Toyota" />
              {form.formState.errors.make && (
                <p className="text-xs text-destructive">{form.formState.errors.make.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" {...form.register('model')} placeholder="Camry" />
              {form.formState.errors.model && (
                <p className="text-xs text-destructive">{form.formState.errors.model.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" type="number" {...form.register('year', { valueAsNumber: true })} />
              {form.formState.errors.year && (
                <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" {...form.register('licensePlate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" {...form.register('vin')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" {...form.register('color')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" type="number" {...form.register('mileage', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engineType">Engine</Label>
              <Input id="engineType" {...form.register('engineType')} placeholder="e.g. V6" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmissionType">Transmission</Label>
            <Select
              value={form.watch('transmissionType') as string || ''}
              onValueChange={(val) => form.setValue('transmissionType', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Automatic">Automatic</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="CVT">CVT</SelectItem>
                <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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
