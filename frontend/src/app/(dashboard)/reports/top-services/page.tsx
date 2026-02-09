'use client';

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type Column } from '@/components/data/data-table';
import { useTopServices } from '@/queries/use-dashboard';
import { formatCurrency } from '@/lib/utils';
import type { TopService } from '@/types/dashboard';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#4f46e5', '#dc2626'];

export default function TopServicesPage() {
  const { data: services, isLoading } = useTopServices(20);

  const columns: Column<TopService>[] = [
    { key: 'rank', header: '#', cell: (_, i) => i !== undefined ? i + 1 : '' },
    { key: 'serviceName', header: 'Service', cell: (s) => <span className="font-medium">{s.serviceName}</span> },
    { key: 'count', header: 'Times Performed', cell: (s) => s.count },
    { key: 'revenue', header: 'Total Revenue', cell: (s) => formatCurrency(s.revenue) },
    {
      key: 'avgRevenue',
      header: 'Avg Revenue',
      cell: (s) => s.count > 0 ? formatCurrency(s.revenue / s.count) : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Top Services"
        description="Most popular services by volume and revenue"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart - count */}
        <Card>
          <CardHeader>
            <CardTitle>Service Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : services && services.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={services.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="serviceName" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" name="Times Performed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No service data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart - revenue share */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Share</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : services && services.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={services.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="revenue"
                    nameKey="serviceName"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {services.slice(0, 8).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No service data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={services ?? []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No service data found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
