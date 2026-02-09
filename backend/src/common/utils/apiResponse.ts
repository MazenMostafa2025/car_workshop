import { Response } from 'express';
import type { PaginationMeta } from '@common/types/pagination';

/**
 * Helper to build consistent JSON responses.
 * Single responsibility: response formatting only.
 */
export const apiResponse = {
  /**
   * Send a success response.
   */
  success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Send a success response with pagination metadata.
   */
  paginated<T>(res: Response, data: T[], meta: PaginationMeta, message: string = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    });
  },

  /**
   * Send a created (201) response.
   */
  created<T>(res: Response, data: T, message: string = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Send a no-content (204) response.
   */
  noContent(res: Response) {
    return res.status(204).send();
  },

  /**
   * Send an error response.
   */
  error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Array<{ field: string; message: string }>,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: {
        code,
        ...(details && { details }),
      },
    });
  },
};
