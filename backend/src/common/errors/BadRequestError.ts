import { AppError } from './AppError';

/**
 * 400 Bad Request — invalid client input or business rule violation.
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}
