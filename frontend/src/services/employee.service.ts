import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Employee } from "@/types/employee";

export interface EmployeeListParams extends ListParams {
  role?: string;
  isActive?: boolean;
}

/** Convert empty-string optional fields to null so backend's .nullish() validation passes. */
function buildEmployeePayload(
  data: Partial<Employee> & { password?: string },
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email || null,
    phone: data.phone || null,
    role: data.role,
    specialization: data.specialization || null,
    hireDate: data.hireDate,
    hourlyRate: data.hourlyRate ?? null,
  };
  // isActive is only valid for update; omit undefined to avoid overwrite
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  return payload;
}

export const employeeService = {
  list: async (
    params?: EmployeeListParams,
  ): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get<PaginatedResponse<Employee>>(
      "/employees",
      { params },
    );
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee>>(
      `/employees/${id}`,
    );
    return response.data.data;
  },

  create: async (
    data: Partial<Employee> & { password?: string },
  ): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>(
      "/employees",
      buildEmployeePayload(data),
    );
    return response.data.data;
  },

  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/employees/${id}`,
      buildEmployeePayload(data),
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
