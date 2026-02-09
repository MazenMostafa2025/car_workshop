import { AppError } from './AppError';

/**
 * 401 Unauthorized — missing or invalid credentials.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}
