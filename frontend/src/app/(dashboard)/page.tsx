'use client';

import Link from 'next/link';
import {
  ClipboardList,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Wrench,
  FileText,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  useDashboardSummary,
  useWorkOrdersByStatus,
  useInventoryAlerts,
  useTopServices,
} from '@/queries/use-dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/data/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#9ca3af',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};
const SERVICE_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: woByStatus } = useWorkOrdersByStatus();
  const { data: lowStock } = useInventoryAlerts();
  const { data: topServices } = useTopServices(5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your workshop operations" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your workshop operations"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/reports"><TrendingUp className="mr-2 h-4 w-4" /> View Reports</Link>
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Work Orders"
          value={summary?.openWorkOrders ?? 0}
          icon={ClipboardList}
          description="Currently open"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(summary?.monthlyRevenue ?? 0)}
          icon={DollarSign}
          description="This month"
        />
        <StatCard
          title="Outstanding Invoices"
          value={summary?.outstandingInvoices ?? 0}
          icon={FileText}
          description="Pending payment"
        />
        <StatCard
          title="Today's Appointments"
          value={summary?.todayAppointments ?? 0}
          icon={Calendar}
          description="Scheduled for today"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Work Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-5 w-5 text-primary" />
              Work Orders by Status
            </CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {woByStatus && woByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={woByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
                  >
                    {woByStatus.map((entry, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No work order data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Services
            </CardTitle>
            <CardDescription>Most performed services</CardDescription>
          </CardHeader>
          <CardContent>
            {topServices && topServices.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="serviceName" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" name="Revenue">
                    {topServices.map((_, idx) => (
                      <Cell key={idx} fill={SERVICE_COLORS[idx % SERVICE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No service data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Parts below minimum stock level</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStock && lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.partNumber && (
                      <p className="text-xs text-muted-foreground">#{item.partNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="text-xs">
                      {item.quantityInStock} in stock
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Min: {item.reorderLevel}
                    </span>
                  </div>
                </div>
              ))}
              {lowStock.length > 10 && (
                <Button asChild variant="link" size="sm" className="px-0">
                  <Link href="/inventory">View all {lowStock.length} alerts →</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              All stock levels are healthy ✓
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
