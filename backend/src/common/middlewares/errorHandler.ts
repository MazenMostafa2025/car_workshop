import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '@common/errors';
import { isDevelopment } from '@config/index';
import { logger } from '@common/utils/logger';

/**
 * Global error handling middleware.
 *
 * Catches ALL errors and returns a consistent JSON response.
 * Maps Prisma errors, Zod errors, and custom AppErrors to proper HTTP statuses.
 *
 * Must be the LAST middleware registered on the Express app.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Structured error logging via winston
  logger.error(err.message, {
    name: err.name,
    stack: err.stack,
    ...(err instanceof AppError && { code: err.code, statusCode: err.statusCode }),
  });

  // --- Custom AppError subclasses ---
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
      },
    });
    return;
  }

  // --- Zod validation errors (if not caught by validate middleware) ---
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details,
      },
    });
    return;
  }

  // --- Prisma errors ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaResponse = handlePrismaError(err);
    res.status(prismaResponse.statusCode).json({
      success: false,
      message: prismaResponse.message,
      error: {
        code: prismaResponse.code,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Database validation error',
      error: {
        code: 'DATABASE_VALIDATION_ERROR',
      },
    });
    return;
  }

  // --- Unexpected / unknown errors ---
  res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    error: {
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && { stack: err.stack }),
    },
  });
};

/**
 * Map Prisma error codes to HTTP status codes.
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
  code: string;
} {
  switch (err.code) {
    case 'P2002': {
      // Unique constraint violation
      const fields = (err.meta?.target as string[]) || ['unknown'];
      return {
        statusCode: 409,
        message: `A record with this ${fields.join(', ')} already exists`,
        code: 'CONFLICT',
      };
    }
    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Record not found',
        code: 'NOT_FOUND',
      };
    case 'P2003': {
      // Foreign key constraint failure
      const field = (err.meta?.field_name as string) || 'related record';
      return {
        statusCode: 400,
        message: `Referenced ${field} does not exist`,
        code: 'FOREIGN_KEY_ERROR',
      };
    }
    case 'P2014':
      // Relation violation
      return {
        statusCode: 400,
        message: 'Cannot delete record because it has related records',
        code: 'RELATION_VIOLATION',
      };
    default:
      return {
        statusCode: 500,
        message: 'Database error',
        code: 'DATABASE_ERROR',
      };
  }
}
