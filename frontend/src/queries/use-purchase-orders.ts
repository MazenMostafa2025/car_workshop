"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  purchaseOrderService,
  type POListParams,
} from "@/services/purchase-order.service";
import type {
  PurchaseOrderFormData,
  PurchaseOrderItemFormData,
} from "@/lib/validations/purchase-order";

export const poKeys = {
  all: ["purchase-orders"] as const,
  lists: () => [...poKeys.all, "list"] as const,
  list: (params?: POListParams) => [...poKeys.lists(), params] as const,
  details: () => [...poKeys.all, "detail"] as const,
  detail: (id: number) => [...poKeys.details(), id] as const,
};

export function usePurchaseOrders(params?: POListParams) {
  return useQuery({
    queryKey: poKeys.list(params),
    queryFn: () => purchaseOrderService.list(params),
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: poKeys.detail(id),
    queryFn: () => purchaseOrderService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseOrderFormData) =>
      purchaseOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
      toast.success("Purchase order created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create purchase order");
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
      toast.success("Purchase order deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete purchase order");
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.receive(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
      queryClient.invalidateQueries({ queryKey: poKeys.detail(id) });
      toast.success("Purchase order received — inventory updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to receive purchase order");
    },
  });
}

export function useAddPOItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      poId,
      data,
    }: {
      poId: number;
      data: PurchaseOrderItemFormData;
    }) => purchaseOrderService.addItem(poId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: poKeys.detail(variables.poId),
      });
      toast.success("Item added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item");
    },
  });
}

export function useRemovePOItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ poId, itemId }: { poId: number; itemId: number }) =>
      purchaseOrderService.removeItem(poId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: poKeys.detail(variables.poId),
      });
      toast.success("Item removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });
}
