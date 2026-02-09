"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerService } from "@/services/customer.service";
import type { ListParams } from "@/types/api";
import type { CustomerFormData } from "@/lib/validations/customer";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params?: ListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

export function useCustomers(params?: ListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.list(params),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerFormData) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Customer created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerFormData }) =>
      customerService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Customer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });
}
