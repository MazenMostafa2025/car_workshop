import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Supplier } from "@/types/supplier";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map backend supplier shape (supplierName) to frontend type (name). */
function mapSupplier(raw: any): Supplier {
  return {
    ...raw,
    name: raw.supplierName ?? raw.name ?? "",
  };
}

export const supplierService = {
  list: async (params?: ListParams): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<PaginatedResponse<any>>("/suppliers", {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapSupplier),
    };
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<any>>(`/suppliers/${id}`);
    return mapSupplier(response.data.data);
  },

  create: async (data: Partial<Supplier>): Promise<Supplier> => {
    const payload: Record<string, unknown> = {
      supplierName: data.name,
      contactPerson: data.contactPerson ?? null,
      email: data.email || null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      postalCode: data.postalCode ?? null,
      notes: data.notes ?? null,
    };
    const response = await apiClient.post<ApiResponse<any>>(
      "/suppliers",
      payload,
    );
    return mapSupplier(response.data.data);
  },

  update: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
    const payload: Record<string, unknown> = {
      supplierName: data.name,
      contactPerson: data.contactPerson,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      notes: data.notes,
    };
    // Remove undefined keys so we only send what changed
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );
    const response = await apiClient.patch<ApiResponse<any>>(
      `/suppliers/${id}`,
      payload,
    );
    return mapSupplier(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
