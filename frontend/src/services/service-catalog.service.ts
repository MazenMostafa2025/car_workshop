import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { ServiceCategory, Service } from "@/types/service-catalog";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map backend category shape (categoryName) to frontend type (name). */
function mapCategory(raw: any): ServiceCategory {
  return {
    ...raw,
    name: raw.categoryName ?? raw.name ?? "",
  };
}

/** Map backend service shape (serviceName, string basePrice) to frontend type. */
function mapService(raw: any): Service {
  return {
    ...raw,
    name: raw.serviceName ?? raw.name ?? "",
    basePrice:
      typeof raw.basePrice === "string"
        ? parseFloat(raw.basePrice)
        : raw.basePrice,
    category: raw.category ? mapCategory(raw.category) : undefined,
  };
}

export const serviceCategoryService = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ServiceCategory>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      "/service-categories",
      { params },
    );
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapCategory),
    };
  },

  getById: async (id: number): Promise<ServiceCategory> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/service-categories/${id}`,
    );
    return mapCategory(response.data.data);
  },

  create: async (data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/service-categories",
      { categoryName: data.name, description: data.description },
    );
    return mapCategory(response.data.data);
  },

  update: async (
    id: number,
    data: Partial<ServiceCategory>,
  ): Promise<ServiceCategory> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/service-categories/${id}`,
      { categoryName: data.name, description: data.description },
    );
    return mapCategory(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/service-categories/${id}`);
  },
};

export const serviceService = {
  list: async (
    params?: ListParams & { categoryId?: number },
  ): Promise<PaginatedResponse<Service>> => {
    const response = await apiClient.get<PaginatedResponse<any>>("/services", {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapService),
    };
  },

  getById: async (id: number): Promise<Service> => {
    const response = await apiClient.get<ApiResponse<any>>(`/services/${id}`);
    return mapService(response.data.data);
  },

  create: async (data: Partial<Service>): Promise<Service> => {
    const payload = {
      serviceName: data.name,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      estimatedDuration: data.estimatedDuration,
      description: data.description,
      isActive: data.isActive,
    };
    const response = await apiClient.post<ApiResponse<any>>(
      "/services",
      payload,
    );
    return mapService(response.data.data);
  },

  update: async (id: number, data: Partial<Service>): Promise<Service> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.serviceName = data.name;
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
    if (data.basePrice !== undefined) payload.basePrice = data.basePrice;
    if (data.estimatedDuration !== undefined)
      payload.estimatedDuration = data.estimatedDuration;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    const response = await apiClient.patch<ApiResponse<any>>(
      `/services/${id}`,
      payload,
    );
    return mapService(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },
};
