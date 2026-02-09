import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { UnauthorizedError } from '@common/errors';
import { prisma } from '@common/database/prisma';
import { AUTH } from '@config/constants';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  employeeId: number | null;
}

/**
 * Authentication middleware.
 *
 * Verifies the JWT Bearer token from the Authorization header.
 * On success, attaches the decoded user payload to `req.user`.
 * On failure, throws UnauthorizedError.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(`${AUTH.TOKEN_TYPE} `)) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, employeeId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or does not exist');
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};
