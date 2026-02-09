import { UserRole } from '@prisma/client';

/**
 * Payload stored inside the JWT token.
 */
export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  employeeId: number | null;
}

/**
 * DTO for user registration.
 */
export interface RegisterDto {
  email: string;
  password: string;
  role?: UserRole;
  employeeId?: number;
}

/**
 * DTO for user login.
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * DTO for changing password.
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Auth response returned after login/register.
 */
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: UserRole;
    employeeId: number | null;
  };
  token: string;
}

/**
 * User profile response (without sensitive data).
 */
export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  employeeId: number | null;
  isActive: boolean;
  createdAt: Date;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    specialization: string | null;
  } | null;
}
