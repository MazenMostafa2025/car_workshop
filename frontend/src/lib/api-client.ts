import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** Axios instance pre-configured for the backend API */
export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor: attach JWT token ──
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: unwrap envelope + handle 401 ──
api.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      message?: string;
      error?: { code?: string; details?: unknown };
    }>,
  ) => {
    // On 401 → clear token + cookie and redirect to login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Rethrow with a more useful message
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  },
);

// Alias for named import compatibility
export { api as apiClient };

export default api;
