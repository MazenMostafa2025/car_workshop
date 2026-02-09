import type {
  WorkOrder,
  WorkOrderService,
  WorkOrderPart,
  Vehicle,
  Customer,
  Employee,
  Service,
  Part,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderServiceStatus,
} from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateWorkOrderDto {
  vehicleId: number;
  customerId: number;
  assignedMechanicId?: number | null;
  scheduledDate?: string | null;
  priority?: WorkOrderPriority;
  customerComplaint?: string | null;
  diagnosis?: string | null;
  mileageIn?: number | null;
}

export interface UpdateWorkOrderDto {
  assignedMechanicId?: number | null;
  scheduledDate?: string | null;
  priority?: WorkOrderPriority;
  customerComplaint?: string | null;
  diagnosis?: string | null;
  workPerformed?: string | null;
  recommendations?: string | null;
  mileageIn?: number | null;
  mileageOut?: number | null;
}

export interface StatusTransitionDto {
  status: WorkOrderStatus;
}

export interface AddWorkOrderServiceDto {
  serviceId: number;
  mechanicId?: number | null;
  quantity?: number;
  unitPrice: number;
  laborHours?: number | null;
  notes?: string | null;
}

export interface UpdateWorkOrderServiceDto {
  mechanicId?: number | null;
  quantity?: number;
  unitPrice?: number;
  laborHours?: number | null;
  status?: WorkOrderServiceStatus;
  notes?: string | null;
}

export interface AddWorkOrderPartDto {
  partId: number;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface UpdateWorkOrderPartDto {
  quantity?: number;
  unitPrice?: number;
  notes?: string | null;
}

// ── Query Filters ─────────────────────────────────────────

export interface WorkOrderListQuery {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  customerId?: number;
  vehicleId?: number;
  mechanicId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'orderDate' | 'scheduledDate' | 'status' | 'priority' | 'totalCost' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type WorkOrderFull = WorkOrder & {
  vehicle: Vehicle;
  customer: Customer;
  assignedMechanic: Employee | null;
  workOrderServices: (WorkOrderService & { service: Service; mechanic: Employee | null })[];
  workOrderParts: (WorkOrderPart & { part: Part })[];
};

// ── Status transition map ─────────────────────────────────

export const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
