import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Customer } from "@/types/customer";

/** Convert empty-string optional fields to null so the backend's `.nullish()` validation passes. */
function sanitizePayload(data: Partial<Customer>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...data };
  const nullableFields = ["email", "address", "city", "postalCode", "notes"];
  for (const key of nullableFields) {
    if (payload[key] === "") {
      payload[key] = null;
    }
  }
  return payload;
}

export const customerService = {
  list: async (params?: ListParams): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<PaginatedResponse<Customer>>(
      "/customers",
      { params },
    );
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `/customers/${id}`,
    );
    return response.data.data;
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>(
      "/customers",
      sanitizePayload(data),
    );
    return response.data.data;
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.patch<ApiResponse<Customer>>(
      `/customers/${id}`,
      sanitizePayload(data),
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
