/**
 * Pagination input (parsed from query params).
 */
export interface PaginationInput {
  page: number;
  limit: number;
}

/**
 * Pagination metadata returned in API responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated result wrapper.
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
