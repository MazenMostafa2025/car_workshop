"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supplierService } from "@/services/supplier.service";
import type { ListParams } from "@/types/api";
import type { SupplierFormData } from "@/lib/validations/supplier";

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params?: ListParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const,
};

export function useSuppliers(params?: ListParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.list(params),
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierFormData) => supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create supplier");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplierFormData }) =>
      supplierService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(variables.id),
      });
      toast.success("Supplier updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update supplier");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplierService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete supplier");
    },
  });
}
