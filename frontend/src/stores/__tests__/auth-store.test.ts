import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  localStorage.clear();
  // Clear cookies
  document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
});

const mockUser = {
  id: 1,
  email: "admin@workshop.com",
  firstName: "Admin",
  lastName: "User",
  role: "ADMIN" as const,
};

describe("useAuthStore", () => {
  describe("initial state", () => {
    it("starts unauthenticated", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("setAuth", () => {
    it("sets user, token, and isAuthenticated", () => {
      useAuthStore.getState().setAuth(mockUser, "jwt-token-123");
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe("jwt-token-123");
      expect(state.isAuthenticated).toBe(true);
    });

    it("stores token in localStorage", () => {
      useAuthStore.getState().setAuth(mockUser, "jwt-token-123");
      expect(localStorage.getItem("token")).toBe("jwt-token-123");
    });

    it("sets auth cookie", () => {
      useAuthStore.getState().setAuth(mockUser, "jwt-token-123");
      expect(document.cookie).toContain("auth-token=jwt-token-123");
    });
  });

  describe("setUser", () => {
    it("updates only the user", () => {
      useAuthStore.getState().setAuth(mockUser, "token-1");
      const updatedUser = { ...mockUser, firstName: "Updated" };
      useAuthStore.getState().setUser(updatedUser);

      const state = useAuthStore.getState();
      expect(state.user?.firstName).toBe("Updated");
      expect(state.token).toBe("token-1"); // unchanged
      expect(state.isAuthenticated).toBe(true); // unchanged
    });
  });

  describe("logout", () => {
    it("clears user, token, and isAuthenticated", () => {
      useAuthStore.getState().setAuth(mockUser, "jwt-token-123");
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("removes token from localStorage", () => {
      localStorage.setItem("token", "jwt-token-123");
      useAuthStore.getState().logout();
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("clears auth cookie", () => {
      useAuthStore.getState().setAuth(mockUser, "jwt-token-123");
      useAuthStore.getState().logout();
      // After clearing, cookie should not contain the token value
      expect(document.cookie).not.toContain("jwt-token-123");
    });
  });

  describe("persist", () => {
    it("store name is auth-storage", () => {
      // The persist middleware stores under this key
      useAuthStore.getState().setAuth(mockUser, "persist-test");
      const stored = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      expect(stored.state).toBeDefined();
      expect(stored.state.token).toBe("persist-test");
      expect(stored.state.isAuthenticated).toBe(true);
    });

    it("partializes only user, token, isAuthenticated", () => {
      useAuthStore.getState().setAuth(mockUser, "partial-test");
      const stored = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      const keys = Object.keys(stored.state);
      expect(keys).toContain("user");
      expect(keys).toContain("token");
      expect(keys).toContain("isAuthenticated");
      // Should NOT contain action functions
      expect(keys).not.toContain("setAuth");
      expect(keys).not.toContain("logout");
    });
  });
});
