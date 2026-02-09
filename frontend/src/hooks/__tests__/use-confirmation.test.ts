import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConfirmation } from "../use-confirmation";

describe("useConfirmation", () => {
  it("starts with open=false and item=null", () => {
    const { result } = renderHook(() => useConfirmation<number>());
    expect(result.current.open).toBe(false);
    expect(result.current.item).toBeNull();
  });

  it("confirm() sets item and opens dialog", () => {
    const { result } = renderHook(() => useConfirmation<{ id: number }>());

    act(() => {
      result.current.confirm({ id: 42 });
    });

    expect(result.current.open).toBe(true);
    expect(result.current.item).toEqual({ id: 42 });
  });

  it("cancel() closes dialog and clears item", () => {
    const { result } = renderHook(() => useConfirmation<number>());

    act(() => {
      result.current.confirm(5);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.cancel();
    });
    expect(result.current.open).toBe(false);
    expect(result.current.item).toBeNull();
  });

  it("handleConfirm() calls callback with item and closes", () => {
    const { result } = renderHook(() => useConfirmation<string>());
    const callback = vi.fn();

    act(() => {
      result.current.confirm("delete-me");
    });

    act(() => {
      result.current.handleConfirm(callback);
    });

    expect(callback).toHaveBeenCalledWith("delete-me");
    expect(result.current.open).toBe(false);
    expect(result.current.item).toBeNull();
  });

  it("handleConfirm() does nothing when no item", () => {
    const { result } = renderHook(() => useConfirmation<string>());
    const callback = vi.fn();

    act(() => {
      result.current.handleConfirm(callback);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
