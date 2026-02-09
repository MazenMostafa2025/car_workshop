'use client';

import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type Column } from '@/components/data/data-table';
import { useMechanicProductivity } from '@/queries/use-dashboard';
import { formatCurrency } from '@/lib/utils';
import type { MechanicProductivity } from '@/types/dashboard';

export default function ProductivityPage() {
  const now = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  const { data: mechanics, isLoading } = useMechanicProductivity({ startDate, endDate });

  const setPreset = (months: number) => {
    setStartDate(format(startOfMonth(subMonths(now, months - 1)), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
  };

  const columns: Column<MechanicProductivity>[] = [
    { key: 'mechanicName', header: 'Mechanic', cell: (m) => <span className="font-medium">{m.mechanicName}</span> },
    { key: 'completedOrders', header: 'Completed Orders', cell: (m) => m.completedOrders },
    { key: 'totalHours', header: 'Hours Logged', cell: (m) => m.totalHours.toFixed(1) },
    { key: 'revenue', header: 'Revenue Generated', cell: (m) => formatCurrency(m.revenue) },
    {
      key: 'avgPerOrder',
      header: 'Avg Per Order',
      cell: (m) => m.completedOrders > 0 ? formatCurrency(m.revenue / m.completedOrders) : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mechanic Productivity"
        description="Analyze mechanic performance and workload"
      />

      {/* Date range */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreset(1)}>This Month</Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(3)}>3 Months</Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(6)}>6 Months</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Completed & Revenue by Mechanic</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : mechanics && mechanics.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mechanics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="mechanicName" type="category" width={120} />
                <Tooltip formatter={(value, name) =>
                  name === 'Revenue ($)' ? formatCurrency(Number(value)) : value
                } />
                <Legend />
                <Bar dataKey="completedOrders" fill="#2563eb" name="Completed Orders" />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No productivity data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mechanics ?? []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No mechanic data found"
          />
        </CardContent>
      </Card>
    </div>
  );
}
