// ── Dashboard Types ───────────────────────────────────────

export interface DashboardDateRange {
  dateFrom?: string;
  dateTo?: string;
}

export interface SummaryKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  pendingInvoices: number;
  todaysAppointments: number;
  lowStockParts: number;
  activeCustomers: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface WorkOrdersByStatus {
  status: string;
  count: number;
}

export interface MechanicProductivity {
  mechanicId: number;
  firstName: string;
  lastName: string;
  completedOrders: number;
  totalRevenue: number;
}

export interface TopService {
  serviceId: number;
  serviceName: string;
  count: number;
  totalRevenue: number;
}

export interface InventoryAlert {
  partId: number;
  partName: string;
  partNumber: string;
  quantityInStock: number;
  reorderLevel: number;
}
