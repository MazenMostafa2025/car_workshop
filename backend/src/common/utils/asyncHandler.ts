import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler to automatically
 * catch rejected promises and forward them to the error handler.
 *
 * Eliminates repetitive try/catch blocks in every controller method.
 *
 * Usage:
 *   router.get('/', asyncHandler(controller.getAll));
 */
type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
