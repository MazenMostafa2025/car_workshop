"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  appointmentService,
  type AppointmentListParams,
} from "@/services/appointment.service";
import type { AppointmentFormData } from "@/lib/validations/appointment";

export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (params?: AppointmentListParams) =>
    [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
  availableSlots: (date: string, mechanicId?: number) =>
    [...appointmentKeys.all, "slots", date, mechanicId] as const,
};

export function useAppointments(params?: AppointmentListParams) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentService.list(params),
  });
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
  });
}

export function useAvailableSlots(date: string, mechanicId?: number) {
  return useQuery({
    queryKey: appointmentKeys.availableSlots(date, mechanicId),
    queryFn: () => appointmentService.getAvailableSlots(date, mechanicId),
    enabled: !!date,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentFormData) => appointmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success("Appointment created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create appointment");
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AppointmentFormData }) =>
      appointmentService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.id),
      });
      toast.success("Appointment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update appointment");
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success("Appointment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete appointment");
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      appointmentService.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.id),
      });
      toast.success("Appointment status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

export function useConvertToWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentService.convertToWorkOrder(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables),
      });
      toast.success("Appointment converted to work order");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to convert appointment");
    },
  });
}
