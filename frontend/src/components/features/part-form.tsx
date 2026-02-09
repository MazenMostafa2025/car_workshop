'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { partSchema, type PartFormData } from '@/lib/validations/inventory';
import type { Part } from '@/types/inventory';
import type { Supplier } from '@/types/supplier';

interface PartFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PartFormData) => void;
  defaultValues?: Part | null;
  suppliers: Supplier[];
  isLoading?: boolean;
}

export function PartForm({ open, onOpenChange, onSubmit, defaultValues, suppliers, isLoading }: PartFormProps) {
  const isEdit = !!defaultValues;

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          partNumber: defaultValues.partNumber || '',
          description: defaultValues.description || '',
          category: defaultValues.category || '',
          supplierId: defaultValues.supplierId,
          unitCost: defaultValues.unitCost,
          sellingPrice: defaultValues.sellingPrice,
          quantityInStock: defaultValues.quantityInStock,
          reorderLevel: defaultValues.reorderLevel,
          location: defaultValues.location || '',
          isActive: defaultValues.isActive,
        }
      : {
          name: '',
          partNumber: '',
          description: '',
          category: '',
          supplierId: null,
          unitCost: 0,
          sellingPrice: 0,
          quantityInStock: 0,
          reorderLevel: 5,
          location: '',
          isActive: true,
        },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Part' : 'Add New Part'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input id="partNumber" {...form.register('partNumber')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...form.register('category')} placeholder="e.g. Brakes, Engine" />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select
                value={form.watch('supplierId') ? String(form.watch('supplierId')) : 'none'}
                onValueChange={(val) => form.setValue('supplierId', val === 'none' ? null : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost ($) *</Label>
              <Input id="unitCost" type="number" step="0.01" {...form.register('unitCost', { valueAsNumber: true })} />
              {form.formState.errors.unitCost && (
                <p className="text-xs text-destructive">{form.formState.errors.unitCost.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price ($) *</Label>
              <Input id="sellingPrice" type="number" step="0.01" {...form.register('sellingPrice', { valueAsNumber: true })} />
              {form.formState.errors.sellingPrice && (
                <p className="text-xs text-destructive">{form.formState.errors.sellingPrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantityInStock">In Stock *</Label>
              <Input id="quantityInStock" type="number" {...form.register('quantityInStock', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input id="reorderLevel" type="number" {...form.register('reorderLevel', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register('location')} placeholder="Shelf A-3" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...form.register('description')} />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
            <Label>Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update Part' : 'Create Part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
