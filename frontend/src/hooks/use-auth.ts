"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import type { LoginRequest, ChangePasswordRequest } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    setAuth,
    setUser,
    logout: storeLogout,
  } = useAuthStore();

  // Fetch current user profile
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const userData = await authService.getMe();
      setUser(userData);
      return userData;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Login successful");
      // Full page navigation so the middleware sees the fresh cookie
      // and Zustand rehydrates from the just-written localStorage.
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  // Logout
  const logout = () => {
    storeLogout();
    queryClient.clear();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return {
    user,
    isAuthenticated,
    isLoadingUser,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    logout,
  };
}
