import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  DashboardSummary,
  RevenueData,
  RevenueVsExpenses,
  MechanicProductivity,
  TopService,
  WorkOrdersByStatus,
  InventoryAlert,
} from "@/types/dashboard";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response =
      await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return response.data.data;
  },

  getRevenue: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueData[]> => {
    const response = await apiClient.get<ApiResponse<RevenueData[]>>(
      "/dashboard/revenue",
      { params },
    );
    return response.data.data;
  },

  getRevenueVsExpenses: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueVsExpenses[]> => {
    const response = await apiClient.get<ApiResponse<RevenueVsExpenses[]>>(
      "/dashboard/revenue-vs-expenses",
      { params },
    );
    return response.data.data;
  },

  getMechanicProductivity: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<MechanicProductivity[]> => {
    const response = await apiClient.get<ApiResponse<MechanicProductivity[]>>(
      "/dashboard/mechanic-productivity",
      { params },
    );
    return response.data.data;
  },

  getTopServices: async (params?: {
    limit?: number;
  }): Promise<TopService[]> => {
    const response = await apiClient.get<ApiResponse<TopService[]>>(
      "/dashboard/top-services",
      { params },
    );
    return response.data.data;
  },

  getWorkOrdersByStatus: async (): Promise<WorkOrdersByStatus[]> => {
    const response = await apiClient.get<ApiResponse<WorkOrdersByStatus[]>>(
      "/dashboard/work-orders-by-status",
    );
    return response.data.data;
  },

  getInventoryAlerts: async (): Promise<InventoryAlert[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      "/dashboard/inventory-alerts",
    );
    return (response.data.data ?? []).map((raw) => ({
      id: raw.id,
      name: raw.partName ?? raw.name ?? "",
      partNumber: raw.partNumber ?? null,
      quantityInStock: raw.quantityInStock ?? 0,
      reorderLevel: raw.reorderLevel ?? 0,
    }));
  },
};
