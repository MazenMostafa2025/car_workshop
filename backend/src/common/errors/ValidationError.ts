import { AppError } from './AppError';

export interface ValidationDetail {
  field: string;
  message: string;
}

/**
 * 400 Bad Request — input validation failed.
 */
export class ValidationError extends AppError {
  public readonly details: ValidationDetail[];

  constructor(message: string = 'Validation failed', details: ValidationDetail[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}
