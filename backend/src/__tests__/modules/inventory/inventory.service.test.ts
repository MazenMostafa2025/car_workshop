/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError, ConflictError, BadRequestError } from '@common/errors';
import { createMockPrismaClient } from '../../helpers/prisma-mock';

const mockPrisma = createMockPrismaClient();
jest.mock('@common/database/prisma', () => ({ prisma: mockPrisma }));

import { inventoryService } from '@modules/inventory/inventory.service';

// ── Fixtures ──────────────────────────────────────────────
const basePart = {
  id: 1,
  partNumber: 'BRK-001',
  partName: 'Brake Pad',
  description: null,
  category: 'Brakes',
  manufacturer: 'Brembo',
  quantityInStock: 50,
  reorderLevel: 10,
  unitCost: { toNumber: () => 15.0 } as any,
  sellingPrice: { toNumber: () => 29.99 } as any,
  supplierId: 1,
  location: 'A1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  supplier: { id: 1, supplierName: 'Auto Parts Inc' },
};

describe('InventoryService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── findAll ───────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated parts', async () => {
      mockPrisma.part.findMany.mockResolvedValue([basePart]);
      mockPrisma.part.count.mockResolvedValue(1);

      const result = await inventoryService.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by category', async () => {
      mockPrisma.part.findMany.mockResolvedValue([]);
      mockPrisma.part.count.mockResolvedValue(0);

      await inventoryService.findAll({ category: 'Brakes' });

      const callArgs = mockPrisma.part.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.category).toEqual(
        expect.objectContaining({ contains: 'Brakes', mode: 'insensitive' }),
      );
    });

    it('filters by search', async () => {
      mockPrisma.part.findMany.mockResolvedValue([]);
      mockPrisma.part.count.mockResolvedValue(0);

      await inventoryService.findAll({ search: 'brake' });

      const callArgs = mockPrisma.part.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR.length).toBe(4);
    });
  });

  // ── findById ──────────────────────────────────────────
  describe('findById', () => {
    it('returns part with supplier', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(basePart);

      const result = await inventoryService.findById(1);
      expect(result.partName).toBe('Brake Pad');
    });

    it('throws NotFoundError for missing part', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(null);
      await expect(inventoryService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ── create ────────────────────────────────────────────
  describe('create', () => {
    it('creates a part successfully', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(null); // no duplicate
      mockPrisma.supplier.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.part.create.mockResolvedValue(basePart);

      const result = await inventoryService.create({
        partNumber: 'BRK-001',
        partName: 'Brake Pad',
        unitCost: 15.0,
        sellingPrice: 29.99,
        supplierId: 1,
      });

      expect(result.partNumber).toBe('BRK-001');
    });

    it('throws ConflictError for duplicate part number', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(basePart); // duplicate

      await expect(
        inventoryService.create({
          partNumber: 'BRK-001',
          partName: 'Duplicate',
          unitCost: 10,
          sellingPrice: 20,
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('throws NotFoundError for invalid supplier', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(null); // no duplicate
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(
        inventoryService.create({
          partNumber: 'NEW-001',
          partName: 'New Part',
          unitCost: 10,
          sellingPrice: 20,
          supplierId: 999,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── adjustStock ───────────────────────────────────────
  describe('adjustStock', () => {
    it('adjusts stock up', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(basePart);
      const adjusted = { ...basePart, quantityInStock: 60 };
      mockPrisma.part.update.mockResolvedValue(adjusted);

      const result = await inventoryService.adjustStock(1, { adjustment: 10, reason: 'Restock' });

      expect(result.quantityInStock).toBe(60);
      expect(mockPrisma.part.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantityInStock: 60 }),
        }),
      );
    });

    it('adjusts stock down', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(basePart);
      const adjusted = { ...basePart, quantityInStock: 45 };
      mockPrisma.part.update.mockResolvedValue(adjusted);

      const result = await inventoryService.adjustStock(1, { adjustment: -5, reason: 'Damaged' });
      expect(result.quantityInStock).toBe(45);
    });

    it('throws BadRequestError for negative result', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(basePart);

      await expect(
        inventoryService.adjustStock(1, { adjustment: -100, reason: 'Too much' }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  // ── getLowStock ───────────────────────────────────────
  describe('getLowStock', () => {
    it('returns only parts at or below reorder level', async () => {
      const lowStockPart = { ...basePart, quantityInStock: 5, reorderLevel: 10 };
      mockPrisma.$queryRaw.mockResolvedValue([{ part_id: 1 }]);
      mockPrisma.part.findMany.mockResolvedValue([lowStockPart]);

      const result = await inventoryService.getLowStock();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  // ── getInventoryValue ─────────────────────────────────
  describe('getInventoryValue', () => {
    it('calculates total inventory value', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { total_cost: 250, total_retail: 500, total_parts: BigInt(2), total_units: BigInt(15) },
      ]);

      const result = await inventoryService.getInventoryValue();

      expect(result.totalCostValue).toBe(250);
      expect(result.totalRetailValue).toBe(500);
      expect(result.totalParts).toBe(2);
      expect(result.totalUnits).toBe(15);
    });
  });

  // ── delete ────────────────────────────────────────────
  describe('delete', () => {
    it('soft-deletes a part', async () => {
      mockPrisma.part.findUnique.mockResolvedValue(basePart);
      mockPrisma.part.update.mockResolvedValue({ ...basePart, isActive: false });

      const result = await inventoryService.delete(1);
      expect(result.isActive).toBe(false);
    });
  });
});
