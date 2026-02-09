"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workOrderService,
  type WorkOrderListParams,
} from "@/services/work-order.service";
import type {
  WorkOrderFormData,
  WorkOrderServiceFormData,
  WorkOrderPartFormData,
} from "@/lib/validations/work-order";

export const workOrderKeys = {
  all: ["work-orders"] as const,
  lists: () => [...workOrderKeys.all, "list"] as const,
  list: (params?: WorkOrderListParams) =>
    [...workOrderKeys.lists(), params] as const,
  details: () => [...workOrderKeys.all, "detail"] as const,
  detail: (id: number) => [...workOrderKeys.details(), id] as const,
};

export function useWorkOrders(params?: WorkOrderListParams) {
  return useQuery({
    queryKey: workOrderKeys.list(params),
    queryFn: () => workOrderService.list(params),
  });
}

export function useWorkOrder(id: number) {
  return useQuery({
    queryKey: workOrderKeys.detail(id),
    queryFn: () => workOrderService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkOrderFormData) => workOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      toast.success("Work order created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create work order");
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<WorkOrderFormData>;
    }) => workOrderService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.detail(variables.id),
      });
      toast.success("Work order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update work order");
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      toast.success("Work order deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete work order");
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      workOrderService.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.detail(variables.id),
      });
      toast.success("Status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

// Work Order Service line items
export function useAddWorkOrderService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workOrderId,
      data,
    }: {
      workOrderId: number;
      data: WorkOrderServiceFormData;
    }) => workOrderService.addService(workOrderId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.detail(variables.workOrderId),
      });
      toast.success("Service added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add service");
    },
  });
}

export function useRemoveWorkOrderService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workOrderId,
      serviceId,
    }: {
      workOrderId: number;
      serviceId: number;
    }) => workOrderService.removeService(workOrderId, serviceId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.detail(variables.workOrderId),
      });
      toast.success("Service removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove service");
    },
  });
}

// Work Order Part line items
export function useAddWorkOrderPart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workOrderId,
      data,
    }: {
      workOrderId: number;
      data: WorkOrderPartFormData;
    }) => workOrderService.addPart(workOrderId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.detail(variables.workOrderId),
      });
      toast.success("Part added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add part");
    },
  });
}

export function useRemoveWorkOrderPart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workOrderId,
      partId,
    }: {
      workOrderId: number;
      partId: number;
    }) => workOrderService.removePart(workOrderId, partId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.detail(variables.workOrderId),
      });
      toast.success("Part removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove part");
    },
  });
}
