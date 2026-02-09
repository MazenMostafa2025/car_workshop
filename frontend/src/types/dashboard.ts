export interface DashboardSummary {
  todayAppointments: number;
  openWorkOrders: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface WorkOrdersByStatus {
  status: string;
  count: number;
}

export interface MechanicProductivity {
  mechanicId: number;
  mechanicName: string;
  completedOrders: number;
  totalHours: number;
  revenue: number;
}

export interface TopService {
  serviceId: number;
  serviceName: string;
  count: number;
  revenue: number;
}

export interface InventoryAlert {
  id: number;
  name: string;
  partNumber: string | null;
  quantityInStock: number;
  reorderLevel: number;
}

export interface RevenueVsExpenses {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}
