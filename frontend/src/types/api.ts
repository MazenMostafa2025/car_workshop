/** Standard API response envelope */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Shared query params for list endpoints */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
