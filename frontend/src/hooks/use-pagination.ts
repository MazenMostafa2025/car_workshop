"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (field: string) => void;
  toggleSortOrder: () => void;
  getParams: () => Record<string, string | number>;
}

/**
 * URL-driven pagination, search, and sorting state.
 * All state is stored in URL search params so it's shareable & bookmarkable.
 */
export function usePagination(defaults?: {
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): UsePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize =
    Number(searchParams.get("limit")) ||
    defaults?.pageSize ||
    DEFAULT_PAGE_SIZE;
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || defaults?.sortBy || "";
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc") ||
    defaults?.sortOrder ||
    "asc";

  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const setPage = useCallback(
    (p: number) => updateParams({ page: p === 1 ? undefined : p }),
    [updateParams],
  );
  const setPageSize = useCallback(
    (s: number) =>
      updateParams({
        limit: s === DEFAULT_PAGE_SIZE ? undefined : s,
        page: undefined,
      }),
    [updateParams],
  );
  const setSearch = useCallback(
    (s: string) => updateParams({ search: s || undefined, page: undefined }),
    [updateParams],
  );
  const setSortBy = useCallback(
    (f: string) => updateParams({ sortBy: f || undefined, page: undefined }),
    [updateParams],
  );
  const toggleSortOrder = useCallback(
    () =>
      updateParams({
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
        page: undefined,
      }),
    [updateParams, sortOrder],
  );

  const getParams = useCallback(
    () => ({
      page,
      limit: pageSize,
      ...(search ? { search } : {}),
      ...(sortBy ? { sortBy, sortOrder } : {}),
    }),
    [page, pageSize, search, sortBy, sortOrder],
  );

  return {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setSortBy,
    toggleSortOrder,
    getParams,
  };
}
