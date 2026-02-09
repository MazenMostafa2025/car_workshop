import { PAGINATION } from '@config/constants';
import type { PaginationMeta } from '@common/types/pagination';

/**
 * Parse page & limit from query params, returning offset for Prisma skip.
 */
export function parsePagination(page?: number, limit?: number) {
  const currentPage = Math.max(page ?? PAGINATION.DEFAULT_PAGE, 1);
  const currentLimit = Math.min(
    Math.max(limit ?? PAGINATION.DEFAULT_LIMIT, 1),
    PAGINATION.MAX_LIMIT,
  );
  const skip = (currentPage - 1) * currentLimit;

  return { page: currentPage, limit: currentLimit, skip };
}

/**
 * Build pagination metadata from total count and current page/limit.
 */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
