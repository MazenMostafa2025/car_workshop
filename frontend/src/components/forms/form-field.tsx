'use client';

import { type ReactNode } from 'react';
import { type FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: FieldError;
  required?: boolean;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, required, description, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
