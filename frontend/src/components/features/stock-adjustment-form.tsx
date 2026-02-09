'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stockAdjustmentSchema, type StockAdjustmentFormData } from '@/lib/validations/inventory';

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockAdjustmentFormData) => void;
  partName: string;
  currentStock: number;
  isLoading?: boolean;
}

export function StockAdjustmentForm({ open, onOpenChange, onSubmit, partName, currentStock, isLoading }: StockAdjustmentFormProps) {
  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      adjustmentType: 'ADD',
      quantity: 0,
      reason: '',
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {partName}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Current stock: <strong>{currentStock}</strong> units
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Adjustment Type *</Label>
            <Select
              value={form.watch('adjustmentType')}
              onValueChange={(val) => form.setValue('adjustmentType', val as 'ADD' | 'REMOVE' | 'SET')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADD">Add Stock</SelectItem>
                <SelectItem value="REMOVE">Remove Stock</SelectItem>
                <SelectItem value="SET">Set Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" type="number" {...form.register('quantity', { valueAsNumber: true })} />
            {form.formState.errors.quantity && (
              <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input id="reason" {...form.register('reason')} placeholder="e.g. New shipment received" />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
