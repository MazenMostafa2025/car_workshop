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
import { expenseSchema, type ExpenseFormData } from '@/lib/validations/expense';
import { EXPENSE_CATEGORY } from '@/lib/constants';
import type { Expense } from '@/types/expense';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExpenseFormData) => void;
  defaultValues?: Expense | null;
  isLoading?: boolean;
}

export function ExpenseForm({ open, onOpenChange, onSubmit, defaultValues, isLoading }: ExpenseFormProps) {
  const isEdit = !!defaultValues;

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues
      ? {
          category: defaultValues.category,
          amount: defaultValues.amount,
          vendor: defaultValues.vendor || '',
          description: defaultValues.description || '',
          expenseDate: format(new Date(defaultValues.expenseDate), 'yyyy-MM-dd'),
          reference: defaultValues.reference || '',
        }
      : {
          category: '',
          amount: 0,
          vendor: '',
          description: '',
          expenseDate: format(new Date(), 'yyyy-MM-dd'),
          reference: '',
        },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Expense' : 'Record Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.watch('category')} onValueChange={(val) => form.setValue('category', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input id="amount" type="number" step="0.01" {...form.register('amount', { valueAsNumber: true })} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" {...form.register('vendor')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date *</Label>
              <Input id="expenseDate" type="date" {...form.register('expenseDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...form.register('description')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" {...form.register('reference')} placeholder="Receipt #, invoice #..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Record Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
