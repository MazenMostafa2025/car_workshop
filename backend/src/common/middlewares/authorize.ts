import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '@common/errors';

/**
 * Authorization middleware factory.
 *
 * Checks that the authenticated user has one of the allowed roles.
 * Must be used AFTER the `authenticate` middleware.
 *
 * Usage:
 *   router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), controller.delete);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`,
        ),
      );
    }

    next();
  };
};
