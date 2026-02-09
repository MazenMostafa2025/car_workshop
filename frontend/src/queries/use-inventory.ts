"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  inventoryService,
  type PartListParams,
} from "@/services/inventory.service";
import type {
  PartFormData,
  StockAdjustmentFormData,
} from "@/lib/validations/inventory";

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (params?: PartListParams) =>
    [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, "detail"] as const,
  detail: (id: number) => [...inventoryKeys.details(), id] as const,
  lowStock: () => [...inventoryKeys.all, "low-stock"] as const,
  value: () => [...inventoryKeys.all, "value"] as const,
};

export function useParts(params?: PartListParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryService.list(params),
  });
}

export function usePart(id: number) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
}

export function useLowStockParts() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStock(),
  });
}

export function useInventoryValue() {
  return useQuery({
    queryKey: inventoryKeys.value(),
    queryFn: () => inventoryService.getInventoryValue(),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PartFormData) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success("Part created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create part");
    },
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartFormData }) =>
      inventoryService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      toast.success("Part updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update part");
    },
  });
}

export function useDeletePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success("Part deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete part");
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockAdjustmentFormData }) =>
      inventoryService.adjustStock(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.value() });
      toast.success("Stock adjusted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to adjust stock");
    },
  });
}
