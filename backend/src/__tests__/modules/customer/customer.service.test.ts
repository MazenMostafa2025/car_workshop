/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError, ConflictError } from '@common/errors';
import { createMockPrismaClient } from '../../helpers/prisma-mock';

// ── Mock Prisma before importing the service ───────────────
const mockPrisma = createMockPrismaClient();
jest.mock('@common/database/prisma', () => ({ prisma: mockPrisma }));

import { customerService } from '@modules/customer/customer.service';

// ── Fixtures ───────────────────────────────────────────────
const baseCustomer = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  address: null,
  city: null,
  postalCode: null,
  dateRegistered: new Date(),
  notes: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CustomerService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── findAll ───────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated customers', async () => {
      const customers = [baseCustomer];
      mockPrisma.customer.findMany.mockResolvedValue(customers);
      mockPrisma.customer.count.mockResolvedValue(1);

      const result = await customerService.findAll({});

      expect(result.data).toEqual(customers);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.customer.count).toHaveBeenCalledTimes(1);
    });

    it('applies search filter', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);

      await customerService.findAll({ search: 'john' });

      const callArgs = mockPrisma.customer.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR).toHaveLength(4);
    });

    it('applies isActive filter', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);

      await customerService.findAll({ isActive: true });

      const callArgs = mockPrisma.customer.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.isActive).toBe(true);
    });

    it('applies custom sort', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(0);

      await customerService.findAll({ sortBy: 'firstName', sortOrder: 'asc' });

      const callArgs = mockPrisma.customer.findMany.mock.calls[0][0] as any;
      expect(callArgs.orderBy).toEqual({ firstName: 'asc' });
    });
  });

  // ── findById ──────────────────────────────────────────
  describe('findById', () => {
    it('returns customer with vehicles', async () => {
      const customerWithVehicles = { ...baseCustomer, vehicles: [] };
      mockPrisma.customer.findUnique.mockResolvedValue(customerWithVehicles);

      const result = await customerService.findById(1);

      expect(result).toEqual(customerWithVehicles);
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 }, include: expect.any(Object) }),
      );
    });

    it('throws NotFoundError for missing customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(customerService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ── create ────────────────────────────────────────────
  describe('create', () => {
    it('creates a customer successfully', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null); // no duplicate email
      mockPrisma.customer.create.mockResolvedValue(baseCustomer);

      const result = await customerService.create({
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        email: 'john@example.com',
      });

      expect(result).toEqual(baseCustomer);
      expect(mockPrisma.customer.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictError if email already exists', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(baseCustomer); // email exists

      await expect(
        customerService.create({
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '555-5678',
          email: 'john@example.com',
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockPrisma.customer.create).not.toHaveBeenCalled();
    });

    it('skips email check when email is not provided', async () => {
      mockPrisma.customer.create.mockResolvedValue({ ...baseCustomer, email: null });

      await customerService.create({
        firstName: 'No',
        lastName: 'Email',
        phone: '555-0000',
      });

      // findUnique should NOT have been called for email check
      expect(mockPrisma.customer.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.customer.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ────────────────────────────────────────────
  describe('update', () => {
    it('updates a customer', async () => {
      // findById call
      mockPrisma.customer.findUnique.mockResolvedValue({ ...baseCustomer, vehicles: [] });
      // email uniqueness check
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      const updated = { ...baseCustomer, firstName: 'Jane' };
      mockPrisma.customer.update.mockResolvedValue(updated);

      const result = await customerService.update(1, {
        firstName: 'Jane',
        email: 'john@example.com',
      });

      expect(result.firstName).toBe('Jane');
    });

    it('throws NotFoundError if customer does not exist', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(customerService.update(999, { firstName: 'X' })).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError if email taken by another customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ ...baseCustomer, vehicles: [] });
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 2 }); // different customer has email

      await expect(customerService.update(1, { email: 'taken@example.com' })).rejects.toThrow(
        ConflictError,
      );
    });
  });

  // ── delete ────────────────────────────────────────────
  describe('delete', () => {
    it('soft-deletes a customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ ...baseCustomer, vehicles: [] });
      mockPrisma.customer.update.mockResolvedValue({ ...baseCustomer, isActive: false });

      const result = await customerService.delete(1);

      expect(result.isActive).toBe(false);
      expect(mockPrisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
    });

    it('throws NotFoundError for missing customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);
      await expect(customerService.delete(999)).rejects.toThrow(NotFoundError);
    });
  });
});
