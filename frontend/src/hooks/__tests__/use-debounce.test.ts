import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello"));
    expect(result.current).toBe("hello");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    // Update value
    rerender({ value: "updated" });

    // Before delay, still old value
    expect(result.current).toBe("initial");

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("uses custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "start" } },
    );

    rerender({ value: "end" });

    // After 300ms, still not updated
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("start");

    // After 500ms total, updated
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("end");
  });

  it("cancels pending update on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "d" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Only the last value should appear
    expect(result.current).toBe("d");
  });
});
