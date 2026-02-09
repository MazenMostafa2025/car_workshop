"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  revenue: (params?: Record<string, string>) =>
    [...dashboardKeys.all, "revenue", params] as const,
  revenueVsExpenses: (params?: Record<string, string>) =>
    [...dashboardKeys.all, "revenue-vs-expenses", params] as const,
  mechanicProductivity: (params?: Record<string, string>) =>
    [...dashboardKeys.all, "mechanic-productivity", params] as const,
  topServices: (limit?: number) =>
    [...dashboardKeys.all, "top-services", limit] as const,
  workOrdersByStatus: () =>
    [...dashboardKeys.all, "work-orders-by-status"] as const,
  inventoryAlerts: () => [...dashboardKeys.all, "inventory-alerts"] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 60_000,
  });
}

export function useRevenue(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: dashboardKeys.revenue(params as Record<string, string>),
    queryFn: () => dashboardService.getRevenue(params),
  });
}

export function useRevenueVsExpenses(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: dashboardKeys.revenueVsExpenses(params as Record<string, string>),
    queryFn: () => dashboardService.getRevenueVsExpenses(params),
  });
}

export function useMechanicProductivity(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: dashboardKeys.mechanicProductivity(
      params as Record<string, string>,
    ),
    queryFn: () => dashboardService.getMechanicProductivity(params),
  });
}

export function useTopServices(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.topServices(limit),
    queryFn: () =>
      dashboardService.getTopServices(limit ? { limit } : undefined),
  });
}

export function useWorkOrdersByStatus() {
  return useQuery({
    queryKey: dashboardKeys.workOrdersByStatus(),
    queryFn: () => dashboardService.getWorkOrdersByStatus(),
  });
}

export function useInventoryAlerts() {
  return useQuery({
    queryKey: dashboardKeys.inventoryAlerts(),
    queryFn: () => dashboardService.getInventoryAlerts(),
  });
}
