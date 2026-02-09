/**
 * Base application error class.
 * All custom errors extend this.
 *
 * Follows the Single Responsibility Principle:
 * each error subclass knows its own HTTP status and error code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace (excludes constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }
}
