'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  customers: 'Customers',
  vehicles: 'Vehicles',
  employees: 'Employees',
  'service-catalog': 'Service Catalog',
  'work-orders': 'Work Orders',
  inventory: 'Inventory',
  suppliers: 'Suppliers',
  invoices: 'Invoices',
  appointments: 'Appointments',
  expenses: 'Expenses',
  'purchase-orders': 'Purchase Orders',
  'service-history': 'Service History',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <span key={href} className="flex items-center">
            <ChevronRight className="mx-2 h-4 w-4" />
            {isLast ? (
              <span className={cn('font-medium text-foreground')}>{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
