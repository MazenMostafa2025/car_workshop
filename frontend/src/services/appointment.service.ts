import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, ListParams } from "@/types/api";
import type { Appointment, AvailableSlot } from "@/types/appointment";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Map backend appointment shape to frontend type.
 * Backend: { appointmentDate, duration } → Frontend: { scheduledDate, startTime, endTime }
 */
function mapAppointment(raw: any): Appointment {
  let scheduledDate = raw.scheduledDate ?? "";
  let startTime = raw.startTime ?? "";
  let endTime = raw.endTime ?? "";

  if (raw.appointmentDate) {
    const dt = new Date(raw.appointmentDate);
    // Only derive times when the date is valid
    if (!isNaN(dt.getTime())) {
      scheduledDate = dt.toISOString();
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      startTime = `${hh}:${mm}`;

      const duration = raw.duration ?? 60; // minutes
      const endDt = new Date(dt.getTime() + duration * 60_000);
      const ehh = String(endDt.getHours()).padStart(2, "0");
      const emm = String(endDt.getMinutes()).padStart(2, "0");
      endTime = `${ehh}:${emm}`;
    }
  }

  return {
    ...raw,
    scheduledDate,
    startTime,
    endTime,
  };
}

export interface AppointmentListParams extends ListParams {
  status?: string;
  customerId?: number;
  mechanicId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const appointmentService = {
  list: async (
    params?: AppointmentListParams,
  ): Promise<PaginatedResponse<Appointment>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      "/appointments",
      { params },
    );
    const data = response.data;
    return {
      ...data,
      data: (data.data ?? []).map(mapAppointment),
    };
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/appointments/${id}`,
    );
    return mapAppointment(response.data.data);
  },

  create: async (data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/appointments",
      data,
    );
    return mapAppointment(response.data.data);
  },

  update: async (
    id: number,
    data: Partial<Appointment>,
  ): Promise<Appointment> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/appointments/${id}`,
      data,
    );
    return mapAppointment(response.data.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },

  updateStatus: async (id: number, status: string): Promise<Appointment> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/appointments/${id}/status`,
      { status },
    );
    return mapAppointment(response.data.data);
  },

  getAvailableSlots: async (
    date: string,
    mechanicId?: number,
  ): Promise<AvailableSlot[]> => {
    const response = await apiClient.get<ApiResponse<AvailableSlot[]>>(
      "/appointments/available-slots",
      {
        params: { date, mechanicId },
      },
    );
    return response.data.data;
  },

  convertToWorkOrder: async (id: number): Promise<{ workOrderId: number }> => {
    const response = await apiClient.post<ApiResponse<{ workOrderId: number }>>(
      `/appointments/${id}/convert`,
    );
    return response.data.data;
  },
};
