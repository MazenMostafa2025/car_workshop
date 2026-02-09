import type { WorkOrderStatus } from '@prisma/client';

// ── Query Filters ─────────────────────────────────────────

export interface ServiceHistoryQuery {
  page?: number;
  limit?: number;
  vehicleId?: number;
  customerId?: number;
  status?: WorkOrderStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'completedDate' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

// ── Vehicle History ───────────────────────────────────────

export interface VehicleHistoryQuery {
  page?: number;
  limit?: number;
}
