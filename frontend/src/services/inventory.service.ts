import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Part, StockAdjustment, InventoryValue } from "@/types/inventory";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map backend part shape (partName, string prices, supplier.supplierName) to frontend. */
function mapPart(raw: any): Part {
  return {
    ...raw,
    name: raw.partName ?? raw.name ?? "",
    unitCost:
      typeof raw.unitCost === "string"
        ? parseFloat(raw.unitCost)
        : (raw.unitCost ?? 0),
    sellingPrice:
      typeof raw.sellingPrice === "string"
        ? parseFloat(raw.sellingPrice)
        : (raw.sellingPrice ?? 0),
    supplier: raw.supplier
      ? {
          id: raw.supplier.id,
          name: raw.supplier.supplierName ?? raw.supplier.name ?? "",
        }
      : undefined,
  };
}

export interface PartListParams extends ListParams {
  supplierId?: number;
  category?: string;
  lowStock?: boolean;
}

export const inventoryService = {
  list: async (params?: PartListParams): Promise<PaginatedResponse<Part>> => {
    const response = await apiClient.get<PaginatedResponse<any>>("/parts", {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapPart),
    };
  },

  getById: async (id: number): Promise<Part> => {
    const response = await apiClient.get<ApiResponse<any>>(`/parts/${id}`);
    return mapPart(response.data.data);
  },

  create: async (data: Partial<Part>): Promise<Part> => {
    const payload: Record<string, unknown> = {
      partName: data.name,
      partNumber: data.partNumber,
      description: data.description,
      category: data.category,
      supplierId: data.supplierId,
      unitCost: data.unitCost,
      sellingPrice: data.sellingPrice,
      quantityInStock: data.quantityInStock,
      reorderLevel: data.reorderLevel,
      location: data.location,
    };
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );
    const response = await apiClient.post<ApiResponse<any>>("/parts", payload);
    return mapPart(response.data.data);
  },

  update: async (id: number, data: Partial<Part>): Promise<Part> => {
    const payload: Record<string, unknown> = {
      partName: data.name,
      partNumber: data.partNumber,
      description: data.description,
      category: data.category,
      supplierId: data.supplierId,
      unitCost: data.unitCost,
      sellingPrice: data.sellingPrice,
      quantityInStock: data.quantityInStock,
      reorderLevel: data.reorderLevel,
      location: data.location,
      isActive: data.isActive,
    };
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );
    const response = await apiClient.patch<ApiResponse<any>>(
      `/parts/${id}`,
      payload,
    );
    return mapPart(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/parts/${id}`);
  },

  adjustStock: async (id: number, data: StockAdjustment): Promise<Part> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/parts/${id}/adjust-stock`,
      data,
    );
    return mapPart(response.data.data);
  },

  getLowStock: async (): Promise<Part[]> => {
    const response =
      await apiClient.get<ApiResponse<any[]>>("/parts/low-stock");
    return (response.data.data ?? []).map(mapPart);
  },

  getInventoryValue: async (): Promise<InventoryValue> => {
    const response = await apiClient.get<ApiResponse<any>>(
      "/parts/inventory-value",
    );
    const raw = response.data.data;
    return {
      totalCost:
        typeof raw.totalCost === "string"
          ? parseFloat(raw.totalCost)
          : (raw.totalCost ?? 0),
      totalRetail:
        typeof raw.totalRetail === "string"
          ? parseFloat(raw.totalRetail)
          : (raw.totalRetail ?? 0),
    };
  },
};
