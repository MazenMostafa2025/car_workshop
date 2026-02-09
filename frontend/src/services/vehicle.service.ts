import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Vehicle } from "@/types/customer";

export interface VehicleListParams extends ListParams {
  customerId?: number;
}

export const vehicleService = {
  list: async (
    params?: VehicleListParams,
  ): Promise<PaginatedResponse<Vehicle>> => {
    const response = await apiClient.get<PaginatedResponse<Vehicle>>(
      "/vehicles",
      { params },
    );
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await apiClient.get<ApiResponse<Vehicle>>(
      `/vehicles/${id}`,
    );
    return response.data.data;
  },

  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.post<ApiResponse<Vehicle>>(
      "/vehicles",
      data,
    );
    return response.data.data;
  },

  update: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.patch<ApiResponse<Vehicle>>(
      `/vehicles/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },

  getByCustomerId: async (customerId: number): Promise<Vehicle[]> => {
    const response = await apiClient.get<PaginatedResponse<Vehicle>>(
      "/vehicles",
      {
        params: { customerId, limit: 100 },
      },
    );
    return response.data.data;
  },
};
