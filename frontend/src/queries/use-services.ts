"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  serviceCategoryService,
  serviceService,
} from "@/services/service-catalog.service";
import type { ListParams } from "@/types/api";
import type {
  ServiceCategoryFormData,
  ServiceFormData,
} from "@/lib/validations/service";

// ── Category Keys & Hooks ──
export const categoryKeys = {
  all: ["service-categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: ListParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

export function useServiceCategories(params?: ListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => serviceCategoryService.list(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceCategoryFormData) =>
      serviceCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceCategoryFormData }) =>
      serviceCategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
}

// ── Service Keys & Hooks ──
export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (params?: ListParams & { categoryId?: number }) =>
    [...serviceKeys.lists(), params] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: number) => [...serviceKeys.details(), id] as const,
};

export function useServices(params?: ListParams & { categoryId?: number }) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => serviceService.list(params),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceFormData) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Service created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create service");
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceFormData }) =>
      serviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Service updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update service");
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Service deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete service");
    },
  });
}
