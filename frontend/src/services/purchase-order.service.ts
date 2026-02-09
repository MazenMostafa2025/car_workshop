import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/purchase-order";

/* eslint-disable @typescript-eslint/no-explicit-any */

function num(v: any): number {
  if (typeof v === "string") return parseFloat(v) || 0;
  return v ?? 0;
}

function mapItem(raw: any): PurchaseOrderItem {
  return {
    ...raw,
    unitCost: num(raw.unitCost),
    totalCost: num(raw.totalCost),
    part: raw.part
      ? {
          id: raw.part.id,
          name: raw.part.partName ?? raw.part.name ?? "",
          partNumber: raw.part.partNumber ?? null,
        }
      : undefined,
  };
}

function mapPO(raw: any): PurchaseOrder {
  return {
    ...raw,
    totalAmount: num(raw.totalAmount),
    supplier: raw.supplier
      ? {
          id: raw.supplier.id,
          name: raw.supplier.supplierName ?? raw.supplier.name ?? "",
        }
      : undefined,
    items: raw.items
      ? raw.items.map(mapItem)
      : raw.purchaseOrderItems
        ? raw.purchaseOrderItems.map(mapItem)
        : undefined,
  };
}

export interface POListParams extends ListParams {
  supplierId?: number;
  status?: string;
}

export const purchaseOrderService = {
  list: async (
    params?: POListParams,
  ): Promise<PaginatedResponse<PurchaseOrder>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      "/purchase-orders",
      { params },
    );
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapPO),
    };
  },

  getById: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/purchase-orders/${id}`,
    );
    return mapPO(response.data.data);
  },

  create: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/purchase-orders",
      data,
    );
    return mapPO(response.data.data);
  },

  update: async (
    id: number,
    data: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/purchase-orders/${id}`,
      data,
    );
    return mapPO(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase-orders/${id}`);
  },

  updateStatus: async (id: number, status: string): Promise<PurchaseOrder> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/purchase-orders/${id}/status`,
      { status },
    );
    return mapPO(response.data.data);
  },

  receive: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/purchase-orders/${id}/receive`,
      {},
    );
    return mapPO(response.data.data);
  },

  // Line items
  addItem: async (
    poId: number,
    data: Partial<PurchaseOrderItem>,
  ): Promise<PurchaseOrderItem> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/purchase-orders/${poId}/items`,
      data,
    );
    return mapItem(response.data.data);
  },

  removeItem: async (poId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/purchase-orders/${poId}/items/${itemId}`);
  },
};
