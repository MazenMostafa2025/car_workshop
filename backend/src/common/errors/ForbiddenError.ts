import { AppError } from './AppError';

/**
 * 403 Forbidden — authenticated but not authorized for this action.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}
