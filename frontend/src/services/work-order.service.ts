import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type {
  WorkOrder,
  WorkOrderService,
  WorkOrderPart,
} from "@/types/work-order";

/* eslint-disable @typescript-eslint/no-explicit-any */

function num(v: any): number {
  if (typeof v === "string") return parseFloat(v) || 0;
  return v ?? 0;
}

function mapWorkOrderService(raw: any): WorkOrderService {
  return {
    ...raw,
    unitPrice: num(raw.unitPrice),
    totalPrice: num(raw.totalPrice),
    service: raw.service
      ? {
          id: raw.service.id,
          name: raw.service.serviceName ?? raw.service.name ?? "",
        }
      : undefined,
  };
}

function mapWorkOrderPart(raw: any): WorkOrderPart {
  return {
    ...raw,
    unitPrice: num(raw.unitPrice),
    totalPrice: num(raw.totalPrice),
    part: raw.part
      ? {
          id: raw.part.id,
          name: raw.part.partName ?? raw.part.name ?? "",
          partNumber: raw.part.partNumber ?? null,
        }
      : undefined,
  };
}

function mapWorkOrder(raw: any): WorkOrder {
  return {
    ...raw,
    description: raw.description ?? raw.customerComplaint ?? null,
    totalLaborCost: num(raw.totalLaborCost),
    totalPartsCost: num(raw.totalPartsCost),
    totalCost: num(raw.totalCost),
    startDate: raw.startDate ?? raw.scheduledDate ?? null,
    services: (raw.workOrderServices ?? raw.services ?? []).map(
      mapWorkOrderService,
    ),
    parts: (raw.workOrderParts ?? raw.parts ?? []).map(mapWorkOrderPart),
  };
}

export interface WorkOrderListParams extends ListParams {
  status?: string;
  priority?: string;
  customerId?: number;
  vehicleId?: number;
  mechanicId?: number;
}

export const workOrderService = {
  list: async (
    params?: WorkOrderListParams,
  ): Promise<PaginatedResponse<WorkOrder>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      "/work-orders",
      { params },
    );
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapWorkOrder),
    };
  },

  getById: async (id: number): Promise<WorkOrder> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/work-orders/${id}`,
    );
    return mapWorkOrder(response.data.data);
  },

  create: async (data: Partial<WorkOrder>): Promise<WorkOrder> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/work-orders",
      data,
    );
    return mapWorkOrder(response.data.data);
  },

  update: async (id: number, data: Partial<WorkOrder>): Promise<WorkOrder> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/work-orders/${id}`,
      data,
    );
    return mapWorkOrder(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/work-orders/${id}`);
  },

  updateStatus: async (id: number, status: string): Promise<WorkOrder> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/work-orders/${id}/status`,
      { status },
    );
    return mapWorkOrder(response.data.data);
  },

  // Work Order Services (line items)
  addService: async (
    workOrderId: number,
    data: Partial<WorkOrderService>,
  ): Promise<WorkOrderService> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/work-orders/${workOrderId}/services`,
      data,
    );
    return mapWorkOrderService(response.data.data);
  },

  updateService: async (
    workOrderId: number,
    serviceId: number,
    data: Partial<WorkOrderService>,
  ): Promise<WorkOrderService> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/work-orders/${workOrderId}/services/${serviceId}`,
      data,
    );
    return mapWorkOrderService(response.data.data);
  },

  removeService: async (
    workOrderId: number,
    serviceId: number,
  ): Promise<void> => {
    await apiClient.delete(`/work-orders/${workOrderId}/services/${serviceId}`);
  },

  // Work Order Parts (line items)
  addPart: async (
    workOrderId: number,
    data: Partial<WorkOrderPart>,
  ): Promise<WorkOrderPart> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/work-orders/${workOrderId}/parts`,
      data,
    );
    return mapWorkOrderPart(response.data.data);
  },

  updatePart: async (
    workOrderId: number,
    partId: number,
    data: Partial<WorkOrderPart>,
  ): Promise<WorkOrderPart> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/work-orders/${workOrderId}/parts/${partId}`,
      data,
    );
    return mapWorkOrderPart(response.data.data);
  },

  removePart: async (workOrderId: number, partId: number): Promise<void> => {
    await apiClient.delete(`/work-orders/${workOrderId}/parts/${partId}`);
  },
};
