"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  employeeService,
  type EmployeeListParams,
} from "@/services/employee.service";
import type { EmployeeFormData } from "@/lib/validations/employee";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params?: EmployeeListParams) =>
    [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};

export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.list(params),
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeFormData) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Employee created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeFormData }) =>
      employeeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.id),
      });
      toast.success("Employee updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Employee deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });
}
