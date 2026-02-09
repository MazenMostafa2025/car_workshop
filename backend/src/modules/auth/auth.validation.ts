import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Validation schema for user registration.
 */
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Must be a valid email address')
      .max(100),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    role: z.nativeEnum(UserRole).optional().default(UserRole.RECEPTIONIST),
    employeeId: z.coerce.number().int().positive().optional(),
  }),
});

/**
 * Validation schema for user login.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Must be a valid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

/**
 * Validation schema for changing password.
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'New password must be at least 8 characters')
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
  }),
});

// Inferred types
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
