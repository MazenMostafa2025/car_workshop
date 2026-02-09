"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  vehicleService,
  type VehicleListParams,
} from "@/services/vehicle.service";
import type { VehicleFormData } from "@/lib/validations/vehicle";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehicleKeys.all, "list"] as const,
  list: (params?: VehicleListParams) =>
    [...vehicleKeys.lists(), params] as const,
  details: () => [...vehicleKeys.all, "detail"] as const,
  detail: (id: number) => [...vehicleKeys.details(), id] as const,
  byCustomer: (customerId: number) =>
    [...vehicleKeys.all, "customer", customerId] as const,
};

export function useVehicles(params?: VehicleListParams) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehicleService.list(params),
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useCustomerVehicles(customerId: number) {
  return useQuery({
    queryKey: vehicleKeys.byCustomer(customerId),
    queryFn: () => vehicleService.getByCustomerId(customerId),
    enabled: !!customerId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleFormData) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success("Vehicle created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create vehicle");
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleFormData }) =>
      vehicleService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
      toast.success("Vehicle updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vehicle");
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success("Vehicle deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vehicle");
    },
  });
}
