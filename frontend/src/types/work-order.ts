export type WorkOrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type WorkOrderPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface WorkOrder {
  id: number;
  customerId: number;
  vehicleId: number;
  assignedMechanicId: number | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  description: string | null;
  diagnosis: string | null;
  startDate: string | null;
  completionDate: string | null;
  estimatedCompletionDate: string | null;
  totalLaborCost: number;
  totalPartsCost: number;
  totalCost: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: number; firstName: string; lastName: string; phone: string };
  vehicle?: {
    id: number;
    make: string;
    model: string;
    year: number;
    licensePlate: string | null;
  };
  assignedMechanic?: { id: number; firstName: string; lastName: string };
  services?: WorkOrderService[];
  parts?: WorkOrderPart[];
  _count?: { services: number; parts: number };
}

export interface WorkOrderService {
  id: number;
  workOrderId: number;
  serviceId: number;
  mechanicId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  service?: { id: number; name: string };
  mechanic?: { id: number; firstName: string; lastName: string };
}

export interface WorkOrderPart {
  id: number;
  workOrderId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  part?: { id: number; name: string; partNumber: string | null };
}
