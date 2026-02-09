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
import { paymentSchema, type PaymentFormData } from '@/lib/validations/invoice';
import { PAYMENT_METHOD } from '@/lib/constants';

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentFormData) => void;
  invoiceId: number;
  balanceDue: number;
  isLoading?: boolean;
}

export function PaymentForm({ open, onOpenChange, onSubmit, invoiceId, balanceDue, isLoading }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId,
      amount: balanceDue,
      paymentMethod: 'CASH',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      reference: '',
      notes: '',
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Balance due: <strong>${balanceDue.toFixed(2)}</strong></p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input id="amount" type="number" step="0.01" {...form.register('amount', { valueAsNumber: true })} />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={form.watch('paymentMethod')} onValueChange={(val) => form.setValue('paymentMethod', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Date *</Label>
            <Input id="paymentDate" type="date" {...form.register('paymentDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" {...form.register('reference')} placeholder="Check #, transaction ID..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...form.register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
