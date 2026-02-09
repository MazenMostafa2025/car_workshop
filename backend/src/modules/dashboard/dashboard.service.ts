import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import type {
  DashboardDateRange,
  SummaryKPIs,
  RevenueDataPoint,
  WorkOrdersByStatus,
  MechanicProductivity,
  TopService,
  InventoryAlert,
} from './dashboard.types';

/**
 * Dashboard Service — aggregate read-only queries for analytics.
 */
class DashboardService {
  /**
   * Summary KPIs — top-level numbers for the dashboard.
   */
  async getSummary(range: DashboardDateRange): Promise<SummaryKPIs> {
    const dateFilter = this.buildDateFilter(range);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      revenueAgg,
      expenseAgg,
      openWO,
      completedWO,
      pendingInvoices,
      todaysAppointments,
      activeCustomers,
      lowStockResult,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          ...(dateFilter.invoiceDate ? { invoiceDate: dateFilter.invoiceDate } : {}),
        },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: dateFilter.expenseDate ? { expenseDate: dateFilter.expenseDate } : {},
        _sum: { amount: true },
      }),
      prisma.workOrder.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.workOrder.count({
        where: {
          status: 'COMPLETED',
          ...(dateFilter.createdAt ? { completionDate: dateFilter.createdAt } : {}),
        },
      }),
      prisma.invoice.count({ where: { status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } } }),
      prisma.appointment.count({
        where: {
          appointmentDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.$queryRaw<[{ count: bigint }]>(
        Prisma.sql`SELECT COUNT(*) as count FROM parts WHERE is_active = true AND quantity_in_stock <= reorder_level`,
      ),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const lowStockCount = Number(lowStockResult[0]?.count ?? 0);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round((totalRevenue - totalExpenses) * 100) / 100,
      openWorkOrders: openWO,
      completedWorkOrders: completedWO,
      pendingInvoices,
      todaysAppointments,
      lowStockParts: lowStockCount,
      activeCustomers,
    };
  }

  /**
   * Revenue over time — daily totals from paid invoices.
   */
  async getRevenueOverTime(range: DashboardDateRange): Promise<RevenueDataPoint[]> {
    const dateFilter = this.buildDateFilter(range);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        ...(dateFilter.invoiceDate ? { invoiceDate: dateFilter.invoiceDate } : {}),
      },
      select: { invoiceDate: true, totalAmount: true },
      orderBy: { invoiceDate: 'asc' },
    });

    // Group by date string
    const grouped: Record<string, number> = {};
    for (const inv of invoices) {
      const dateKey = inv.invoiceDate.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] ?? 0) + Number(inv.totalAmount);
    }

    return Object.entries(grouped).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));
  }

  /**
   * Work orders grouped by status.
   */
  async getWorkOrdersByStatus(): Promise<WorkOrdersByStatus[]> {
    const grouped = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
    return statuses.map((status) => ({
      status,
      count: grouped.find((g) => g.status === status)?._count?.status ?? 0,
    }));
  }

  /**
   * Mechanic productivity — completed orders & revenue per mechanic.
   */
  async getMechanicProductivity(range: DashboardDateRange): Promise<MechanicProductivity[]> {
    const dateFilter = this.buildDateFilter(range);

    const mechanics = await prisma.employee.findMany({
      where: { role: 'MECHANIC', isActive: true },
      include: {
        assignedWorkOrders: {
          where: {
            status: 'COMPLETED',
            ...(dateFilter.createdAt ? { completionDate: dateFilter.createdAt } : {}),
          },
          select: { totalCost: true },
        },
      },
    });

    return mechanics
      .map((m) => ({
        mechanicId: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        completedOrders: m.assignedWorkOrders.length,
        totalRevenue:
          Math.round(
            m.assignedWorkOrders.reduce((s: number, wo) => s + Number(wo.totalCost), 0) * 100,
          ) / 100,
      }))
      .sort((a, b) => b.completedOrders - a.completedOrders);
  }

  /**
   * Top services — most-used services with revenue.
   */
  async getTopServices(limit = 10): Promise<TopService[]> {
    const services = await prisma.workOrderService.groupBy({
      by: ['serviceId'],
      _count: { serviceId: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: limit,
    });

    const serviceIds = services.map((s) => s.serviceId);
    const serviceDetails = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, serviceName: true },
    });

    const detailMap = new Map(serviceDetails.map((s) => [s.id, s.serviceName]));

    return services.map((s) => ({
      serviceId: s.serviceId,
      serviceName: detailMap.get(s.serviceId) ?? 'Unknown',
      count: s._count?.serviceId ?? 0,
      totalRevenue: Math.round(Number(s._sum?.totalPrice ?? 0) * 100) / 100,
    }));
  }

  /**
   * Inventory alerts — parts where stock is at or below reorder level.
   */
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const alerts = await prisma.$queryRaw<InventoryAlert[]>(
      Prisma.sql`SELECT part_id AS "partId", part_name AS "partName", part_number AS "partNumber",
                        quantity_in_stock AS "quantityInStock", reorder_level AS "reorderLevel"
                 FROM parts
                 WHERE is_active = true AND quantity_in_stock <= reorder_level
                 ORDER BY quantity_in_stock ASC`,
    );

    return alerts;
  }

  /**
   * Revenue vs Expenses — monthly comparison.
   */
  async getRevenueVsExpenses(range: DashboardDateRange) {
    const dateFilter = this.buildDateFilter(range);

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          status: 'PAID',
          ...(dateFilter.invoiceDate ? { invoiceDate: dateFilter.invoiceDate } : {}),
        },
        select: { invoiceDate: true, totalAmount: true },
      }),
      prisma.expense.findMany({
        where: dateFilter.expenseDate ? { expenseDate: dateFilter.expenseDate } : {},
        select: { expenseDate: true, amount: true },
      }),
    ]);

    // Group by YYYY-MM
    const monthlyRevenue: Record<string, number> = {};
    const monthlyExpenses: Record<string, number> = {};

    for (const inv of invoices) {
      const key = inv.invoiceDate.toISOString().substring(0, 7);
      monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + Number(inv.totalAmount);
    }

    for (const exp of expenses) {
      const key = exp.expenseDate.toISOString().substring(0, 7);
      monthlyExpenses[key] = (monthlyExpenses[key] ?? 0) + Number(exp.amount);
    }

    // Merge months
    const allMonths = [
      ...new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyExpenses)]),
    ].sort();

    return allMonths.map((month) => {
      const revenue = Math.round((monthlyRevenue[month] ?? 0) * 100) / 100;
      const expense = Math.round((monthlyExpenses[month] ?? 0) * 100) / 100;
      return {
        month,
        revenue,
        expenses: expense,
        profit: Math.round((revenue - expense) * 100) / 100,
      };
    });
  }

  // ── Helpers ───────────────────────────────────────────

  private buildDateFilter(range: DashboardDateRange) {
    const result: {
      invoiceDate?: { gte?: Date; lte?: Date };
      expenseDate?: { gte?: Date; lte?: Date };
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (range.dateFrom || range.dateTo) {
      const filter: { gte?: Date; lte?: Date } = {};
      if (range.dateFrom) {
        filter.gte = new Date(range.dateFrom);
      }
      if (range.dateTo) {
        filter.lte = new Date(range.dateTo);
      }

      result.invoiceDate = filter;
      result.expenseDate = filter;
      result.createdAt = filter;
    }

    return result;
  }
}

export const dashboardService = new DashboardService();
