import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";

/** Set a cookie accessible by Next.js middleware (non-httpOnly so it can be managed client-side). */
function setAuthCookie(token: string) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days (matches JWT expiry)
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Clear the auth cookie. */
function clearAuthCookie() {
  document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        setAuthCookie(token);
        set({ user, token, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem("token");
        clearAuthCookie();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
