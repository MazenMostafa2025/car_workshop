/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictError, NotFoundError, UnauthorizedError } from '@common/errors';
import { createMockPrismaClient } from '../../helpers/prisma-mock';

const mockPrisma = createMockPrismaClient();
jest.mock('@common/database/prisma', () => ({ prisma: mockPrisma }));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$hashed$'),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '@modules/auth/auth.service';

// ── Fixtures ──────────────────────────────────────────────
const baseUser = {
  id: 1,
  email: 'admin@workshop.com',
  passwordHash: '$hashed$',
  role: 'ADMIN' as const,
  employeeId: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Re-setup bcrypt/jwt mocks after reset
    (bcrypt.hash as jest.Mock).mockResolvedValue('$hashed$');
    (bcrypt.compare as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReturnValue('mock.jwt.token');
  });

  // ── register ──────────────────────────────────────────
  describe('register', () => {
    it('registers a new user and returns token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // no existing user
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: 'new@workshop.com',
        role: 'RECEPTIONIST',
        employeeId: null,
      });

      const result = await authService.register({
        email: 'new@workshop.com',
        password: 'Password1',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user.email).toBe('new@workshop.com');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictError if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);

      await expect(
        authService.register({ email: 'admin@workshop.com', password: 'Password1' }),
      ).rejects.toThrow(ConflictError);
    });

    it('throws NotFoundError if employeeId does not exist', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null); // employee link check (not called — employee is findUnique on employee)
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        authService.register({
          email: 'new@workshop.com',
          password: 'Password1',
          employeeId: 999,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError if employee already linked', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(baseUser); // employee already linked
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 1, firstName: 'Emp' });

      await expect(
        authService.register({
          email: 'new@workshop.com',
          password: 'Password1',
          employeeId: 1,
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  // ── login ─────────────────────────────────────────────
  describe('login', () => {
    it('returns token on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'admin@workshop.com',
        password: 'correct-password',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user.id).toBe(1);
    });

    it('throws UnauthorizedError for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nope@workshop.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'admin@workshop.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for deactivated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, isActive: false });

      await expect(
        authService.login({ email: 'admin@workshop.com', password: 'correct' }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ── getProfile ────────────────────────────────────────
  describe('getProfile', () => {
    it('returns user profile', async () => {
      const profile = { ...baseUser, employee: null };
      mockPrisma.user.findUnique.mockResolvedValue(profile);

      const result = await authService.getProfile(1);
      expect(result.email).toBe('admin@workshop.com');
    });

    it('throws NotFoundError for missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ── changePassword ────────────────────────────────────
  describe('changePassword', () => {
    it('changes password successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(baseUser);

      await expect(
        authService.changePassword(1, {
          currentPassword: 'OldPass1',
          newPassword: 'NewPass1',
        }),
      ).resolves.toBeUndefined();

      expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
    });

    it('throws UnauthorizedError if current password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(1, {
          currentPassword: 'WrongPass',
          newPassword: 'NewPass1',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws NotFoundError for missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.changePassword(999, {
          currentPassword: 'OldPass1',
          newPassword: 'NewPass1',
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
