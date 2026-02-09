import { UserRole } from '@prisma/client';

/**
 * Augment Express Request to include authenticated user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: UserRole;
        employeeId: number | null;
      };
    }
  }
}

export {};
