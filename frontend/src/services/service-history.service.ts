import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { ServiceHistory } from "@/types/service-history";

export const serviceHistoryService = {
  list: async (
    params?: Record<string, string | number>,
  ): Promise<PaginatedResponse<ServiceHistory>> => {
    const response = await apiClient.get<PaginatedResponse<ServiceHistory>>(
      "/service-history",
      { params },
    );
    return response.data;
  },

  getByVehicle: async (
    vehicleId: number,
    params?: Record<string, string | number>,
  ): Promise<PaginatedResponse<ServiceHistory>> => {
    const response = await apiClient.get<PaginatedResponse<ServiceHistory>>(
      `/service-history/vehicle/${vehicleId}`,
      { params },
    );
    return response.data;
  },

  getByCustomer: async (
    customerId: number,
    params?: Record<string, string | number>,
  ): Promise<PaginatedResponse<ServiceHistory>> => {
    const response = await apiClient.get<PaginatedResponse<ServiceHistory>>(
      `/service-history/customer/${customerId}`,
      { params },
    );
    return response.data;
  },
};
