import { Request, Response } from 'express';

/**
 * Catch-all handler for routes that don't match any registered endpoint.
 * Returns a 404 JSON response.
 */
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${_req.method} ${_req.originalUrl}`,
    error: {
      code: 'NOT_FOUND',
    },
  });
};
