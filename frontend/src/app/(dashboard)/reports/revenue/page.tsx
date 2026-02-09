'use client';

import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useRevenue, useRevenueVsExpenses, useDashboardSummary } from '@/queries/use-dashboard';
import { formatCurrency } from '@/lib/utils';

export default function RevenuePage() {
  const now = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(subMonths(now, 11)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  const { data: summary } = useDashboardSummary();
  const { data: revenueData, isLoading: revenueLoading } = useRevenue({ startDate, endDate });
  const { data: rveData, isLoading: rveLoading } = useRevenueVsExpenses({ startDate, endDate });

  const setPreset = (months: number) => {
    setStartDate(format(startOfMonth(subMonths(now, months - 1)), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Analytics"
        description="Track revenue trends and financial performance"
      />

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.monthlyRevenue ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
            <p className="text-2xl font-bold">{summary?.outstandingInvoices ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Date Range</p>
            <p className="text-lg font-medium">{startDate} → {endDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Date range filters */}
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
              <Button variant="outline" size="sm" onClick={() => setPreset(3)}>3 Mo</Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(6)}>6 Mo</Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(12)}>12 Mo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue over time chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No revenue data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue vs Expenses chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {rveLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : rveData && rveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={rveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#22c55e" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
