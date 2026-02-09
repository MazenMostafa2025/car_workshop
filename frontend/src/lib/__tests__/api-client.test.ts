import { describe, it, expect, vi, beforeEach } from "vitest";

// We'll test the api-client module's interceptor logic by importing
// and examining the axios instance setup.
// Since the module creates a singleton, we test behavior via mocking.

describe("api-client", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("exports api and apiClient", async () => {
    const mod = await import("../api-client");
    expect(mod.api).toBeDefined();
    expect(mod.apiClient).toBeDefined();
    expect(mod.api).toBe(mod.apiClient);
  });

  it("has correct baseURL", async () => {
    const mod = await import("../api-client");
    expect(mod.api.defaults.baseURL).toContain("/api/v1");
  });

  it("has JSON content type", async () => {
    const mod = await import("../api-client");
    expect(mod.api.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("has 15s timeout", async () => {
    const mod = await import("../api-client");
    expect(mod.api.defaults.timeout).toBe(15000);
  });

  it("request interceptor attaches token from localStorage", async () => {
    localStorage.setItem("token", "test-jwt-token");
    const mod = await import("../api-client");

    // Manually run the request interceptor
    const config = {
      headers: {} as Record<string, string>,
    };
    // The interceptor is the first one added
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interceptor = (mod.api.interceptors.request as any).handlers[0];
    const result = interceptor.fulfilled(config);
    expect(result.headers.Authorization).toBe("Bearer test-jwt-token");
  });

  it("request interceptor skips token when not in localStorage", async () => {
    const mod = await import("../api-client");

    const config = {
      headers: {} as Record<string, string>,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interceptor = (mod.api.interceptors.request as any).handlers[0];
    const result = interceptor.fulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});
