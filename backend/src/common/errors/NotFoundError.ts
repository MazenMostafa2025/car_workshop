import { AppError } from './AppError';

/**
 * 404 Not Found — resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', identifier?: string | number) {
    const message = identifier
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}
