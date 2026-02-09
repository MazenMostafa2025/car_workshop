'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, type ServiceFormData } from '@/lib/validations/service';
import type { Service, ServiceCategory } from '@/types/service-catalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ServiceFormData) => void;
  defaultValues?: Service | null;
  categories: ServiceCategory[];
  isLoading?: boolean;
}

export function ServiceForm({ open, onOpenChange, onSubmit, defaultValues, categories, isLoading }: ServiceFormProps) {
  const isEdit = !!defaultValues;

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || '',
          categoryId: defaultValues.categoryId,
          basePrice: defaultValues.basePrice,
          estimatedDuration: defaultValues.estimatedDuration,
          isActive: defaultValues.isActive,
        }
      : {
          name: '',
          description: '',
          categoryId: 0,
          basePrice: 0,
          estimatedDuration: 30,
          isActive: true,
        },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Service' : 'New Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={String(form.watch('categoryId') || '')}
              onValueChange={(val) => form.setValue('categoryId', Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price ($) *</Label>
              <Input id="basePrice" type="number" step="0.01" {...form.register('basePrice', { valueAsNumber: true })} />
              {form.formState.errors.basePrice && (
                <p className="text-xs text-destructive">{form.formState.errors.basePrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Duration (min) *</Label>
              <Input id="estimatedDuration" type="number" {...form.register('estimatedDuration', { valueAsNumber: true })} />
              {form.formState.errors.estimatedDuration && (
                <p className="text-xs text-destructive">{form.formState.errors.estimatedDuration.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register('description')} />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(val) => form.setValue('isActive', val)}
            />
            <Label>Active</Label>
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
