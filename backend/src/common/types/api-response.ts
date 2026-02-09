import { PaginationMeta } from './pagination';

/**
 * Standard API response envelope — success.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Standard API response envelope — error.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Array<{ field: string; message: string }>;
  };
}

/**
 * Union type for any API response.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
