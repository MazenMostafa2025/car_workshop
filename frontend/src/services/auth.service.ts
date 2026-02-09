import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  LoginRequest,
  LoginResponse,
  User,
  ChangePasswordRequest,
} from "@/types/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/login",
      data,
    );
    const raw = response.data.data;
    return {
      token: raw.token,
      user: {
        id: raw.user.id,
        email: raw.user.email,
        role: raw.user.role,
        firstName: raw.user.employee?.firstName ?? raw.user.firstName ?? "",
        lastName: raw.user.employee?.lastName ?? raw.user.lastName ?? "",
      },
    };
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<any>>("/auth/me");
    const raw = response.data.data;
    return {
      id: raw.id,
      email: raw.email,
      role: raw.role,
      firstName: raw.employee?.firstName ?? raw.firstName ?? "",
      lastName: raw.employee?.lastName ?? raw.lastName ?? "",
    };
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch("/auth/change-password", data);
  },
};
