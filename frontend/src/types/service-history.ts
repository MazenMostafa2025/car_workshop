export interface ServiceHistory {
  id: number;
  workOrderId: number;
  vehicleId: number;
  customerId: number;
  mechanicId: number | null;
  serviceDate: string;
  description: string | null;
  mileageAtService: number | null;
  totalCost: number;
  createdAt: string;
  workOrder?: { id: number; status: string };
  vehicle?: { id: number; make: string; model: string };
  mechanic?: { id: number; firstName: string; lastName: string };
}
