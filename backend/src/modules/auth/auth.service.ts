import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@common/database/prisma';
import { config } from '@config/index';
import { AUTH } from '@config/constants';
import { ConflictError, NotFoundError, UnauthorizedError } from '@common/errors';
import type {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  AuthResponse,
  UserProfile,
  JwtPayload,
} from './auth.types';

/**
 * Auth Service — handles all authentication business logic.
 *
 * Single Responsibility: authentication & user identity management.
 * Does NOT know about Express (no req/res).
 */
class AuthService {
  /**
   * Register a new user.
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    // If employeeId is provided, verify it exists and isn't already linked
    if (data.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
      });

      if (!employee) {
        throw new NotFoundError('Employee', data.employeeId);
      }

      const linkedUser = await prisma.user.findUnique({
        where: { employeeId: data.employeeId },
      });

      if (linkedUser) {
        throw new ConflictError('This employee already has a user account');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, AUTH.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role ?? 'RECEPTIONIST',
        employeeId: data.employeeId ?? null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        employeeId: true,
      },
    });

    // Generate JWT
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
      token,
    };
  }

  /**
   * Login with email and password.
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
      token,
    };
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: number): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialization: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  /**
   * Change the current user's password.
   */
  async changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!isCurrentValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash and update new password
    const newHash = await bcrypt.hash(data.newPassword, AUTH.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  /**
   * Generate a JWT token from a payload.
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}

// Export a singleton instance
export const authService = new AuthService();
