import { AppError } from './AppError';

/**
 * 409 Conflict — duplicate resource or state conflict.
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}
