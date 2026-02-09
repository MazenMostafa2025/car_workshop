"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceHistoryService } from "@/services/service-history.service";

export const serviceHistoryKeys = {
  all: ["service-history"] as const,
  list: (params?: Record<string, string | number>) =>
    [...serviceHistoryKeys.all, "list", params] as const,
  byVehicle: (vehicleId: number, params?: Record<string, string | number>) =>
    [...serviceHistoryKeys.all, "vehicle", vehicleId, params] as const,
  byCustomer: (customerId: number, params?: Record<string, string | number>) =>
    [...serviceHistoryKeys.all, "customer", customerId, params] as const,
};

export function useServiceHistory(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: serviceHistoryKeys.list(params),
    queryFn: () => serviceHistoryService.list(params),
  });
}

export function useVehicleServiceHistory(
  vehicleId: number,
  params?: Record<string, string | number>,
) {
  return useQuery({
    queryKey: serviceHistoryKeys.byVehicle(vehicleId, params),
    queryFn: () => serviceHistoryService.getByVehicle(vehicleId, params),
    enabled: !!vehicleId,
  });
}

export function useCustomerServiceHistory(
  customerId: number,
  params?: Record<string, string | number>,
) {
  return useQuery({
    queryKey: serviceHistoryKeys.byCustomer(customerId, params),
    queryFn: () => serviceHistoryService.getByCustomer(customerId, params),
    enabled: !!customerId,
  });
}
