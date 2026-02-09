/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '@common/errors';
import { createMockPrismaClient } from '../../helpers/prisma-mock';

const mockPrisma = createMockPrismaClient();
jest.mock('@common/database/prisma', () => ({ prisma: mockPrisma }));

// Mock invoice number generator
jest.mock('@common/utils/invoice-number', () => ({
  generateInvoiceNumber: jest.fn().mockResolvedValue('INV-2025-0001'),
}));

import { invoiceService } from '@modules/invoice/invoice.service';

// ── Fixtures ──────────────────────────────────────────────
const baseInvoice = {
  id: 1,
  workOrderId: 1,
  customerId: 1,
  invoiceNumber: 'INV-2025-0001',
  invoiceDate: new Date(),
  dueDate: null,
  subtotal: new Prisma.Decimal(200),
  taxAmount: new Prisma.Decimal(20),
  discountAmount: new Prisma.Decimal(0),
  totalAmount: new Prisma.Decimal(220),
  amountPaid: new Prisma.Decimal(0),
  balanceDue: new Prisma.Decimal(220),
  status: 'UNPAID' as const,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  workOrder: { id: 1, status: 'COMPLETED' },
  customer: { id: 1, firstName: 'John', lastName: 'Doe' },
  payments: [],
};

const completedWorkOrder = {
  id: 1,
  customerId: 1,
  status: 'COMPLETED',
  totalCost: new Prisma.Decimal(200),
};

describe('InvoiceService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── findAll ───────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated invoices', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([baseInvoice]);
      mockPrisma.invoice.count.mockResolvedValue(1);

      const result = await invoiceService.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by status', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      mockPrisma.invoice.count.mockResolvedValue(0);

      await invoiceService.findAll({ status: 'UNPAID' });

      const callArgs = mockPrisma.invoice.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.status).toBe('UNPAID');
    });
  });

  // ── findById ──────────────────────────────────────────
  describe('findById', () => {
    it('returns invoice with full include', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(baseInvoice);

      const result = await invoiceService.findById(1);
      expect(result.invoiceNumber).toBe('INV-2025-0001');
    });

    it('throws NotFoundError for missing invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(invoiceService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ── getOutstanding ────────────────────────────────────
  describe('getOutstanding', () => {
    it('returns unpaid/partially paid invoices', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([baseInvoice]);

      const result = await invoiceService.getOutstanding();

      expect(result).toHaveLength(1);
      const callArgs = mockPrisma.invoice.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.status.in).toContain('UNPAID');
      expect(callArgs.where.status.in).toContain('PARTIALLY_PAID');
    });
  });

  // ── create ────────────────────────────────────────────
  describe('create', () => {
    it('creates invoice from completed work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(completedWorkOrder);
      mockPrisma.invoice.findUnique.mockResolvedValue(null); // no existing invoice
      mockPrisma.invoice.create.mockResolvedValue(baseInvoice);

      const result = await invoiceService.create({ workOrderId: 1, taxRate: 10 });

      expect(result.invoiceNumber).toBe('INV-2025-0001');
      expect(mockPrisma.invoice.create).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundError for missing work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(invoiceService.create({ workOrderId: 999 })).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError for non-completed work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        ...completedWorkOrder,
        status: 'PENDING',
      });

      await expect(invoiceService.create({ workOrderId: 1 })).rejects.toThrow(BadRequestError);
    });

    it('throws ConflictError if invoice already exists for work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(completedWorkOrder);
      mockPrisma.invoice.findUnique.mockResolvedValue(baseInvoice); // already exists

      await expect(invoiceService.create({ workOrderId: 1 })).rejects.toThrow(ConflictError);
    });
  });

  // ── update ────────────────────────────────────────────
  describe('update', () => {
    it('updates invoice and recalculates totals', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(baseInvoice);
      mockPrisma.invoice.update.mockResolvedValue({
        ...baseInvoice,
        discountAmount: new Prisma.Decimal(10),
      });

      const result = await invoiceService.update(1, { discountAmount: 10 });
      expect(mockPrisma.invoice.update).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('throws BadRequestError for fully paid invoice', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({
        ...baseInvoice,
        status: 'PAID',
      });

      await expect(invoiceService.update(1, { discountAmount: 5 })).rejects.toThrow(
        BadRequestError,
      );
    });
  });
});
