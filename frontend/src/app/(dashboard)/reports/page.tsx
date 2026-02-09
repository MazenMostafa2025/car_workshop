'use client';

import Link from 'next/link';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const reports = [
  {
    title: 'Revenue Analytics',
    description: 'Revenue trends, revenue vs expenses, and financial summaries over time.',
    href: '/reports/revenue',
    icon: TrendingUp,
  },
  {
    title: 'Mechanic Productivity',
    description: 'Work orders completed, hours logged, and revenue generated per mechanic.',
    href: '/reports/productivity',
    icon: Users,
  },
  {
    title: 'Top Services',
    description: 'Most popular services by volume and revenue.',
    href: '/reports/top-services',
    icon: BarChart3,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Gain insights into your workshop's performance"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <report.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
