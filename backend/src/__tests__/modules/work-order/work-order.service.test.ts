/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError, BadRequestError } from '@common/errors';
import { createMockPrismaClient } from '../../helpers/prisma-mock';

const mockPrisma = createMockPrismaClient();
jest.mock('@common/database/prisma', () => ({ prisma: mockPrisma }));

import { workOrderService } from '@modules/work-order/work-order.service';

// ── Fixtures ──────────────────────────────────────────────
const baseWorkOrder = {
  id: 1,
  vehicleId: 1,
  customerId: 1,
  assignedMechanicId: null,
  orderDate: new Date(),
  scheduledDate: null,
  completionDate: null,
  status: 'PENDING' as const,
  priority: 'NORMAL' as const,
  totalLaborCost: 0,
  totalPartsCost: 0,
  totalCost: 0,
  customerComplaint: null,
  diagnosis: null,
  workPerformed: null,
  recommendations: null,
  mileageIn: null,
  mileageOut: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  vehicle: { id: 1, make: 'Toyota', model: 'Camry', year: 2022, licensePlate: 'ABC-123' },
  customer: { id: 1, firstName: 'John', lastName: 'Doe' },
  assignedMechanic: null,
  workOrderServices: [],
  workOrderParts: [],
};

const activeVehicle = { id: 1, isActive: true, make: 'Toyota', model: 'Camry' };
const activeCustomer = { id: 1, firstName: 'John', lastName: 'Doe' };
const activeMechanic = { id: 1, firstName: 'Mike', lastName: 'Fix', isActive: true };

describe('WorkOrderService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── findAll ───────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated work orders', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([baseWorkOrder]);
      mockPrisma.workOrder.count.mockResolvedValue(1);

      const result = await workOrderService.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by status and priority', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      mockPrisma.workOrder.count.mockResolvedValue(0);

      await workOrderService.findAll({ status: 'PENDING', priority: 'HIGH' });

      const callArgs = mockPrisma.workOrder.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.status).toBe('PENDING');
      expect(callArgs.where.priority).toBe('HIGH');
    });
  });

  // ── findById ──────────────────────────────────────────
  describe('findById', () => {
    it('returns work order with full include', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);

      const result = await workOrderService.findById(1);
      expect(result.id).toBe(1);
    });

    it('throws NotFoundError for missing work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(null);
      await expect(workOrderService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ── create ────────────────────────────────────────────
  describe('create', () => {
    it('creates a work order', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(activeVehicle);
      mockPrisma.customer.findUnique.mockResolvedValue(activeCustomer);
      mockPrisma.workOrder.create.mockResolvedValue(baseWorkOrder);

      const result = await workOrderService.create({
        vehicleId: 1,
        customerId: 1,
      });

      expect(result.id).toBe(1);
      expect(mockPrisma.workOrder.create).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundError for missing vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(workOrderService.create({ vehicleId: 999, customerId: 1 })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws BadRequestError for inactive vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ ...activeVehicle, isActive: false });

      await expect(workOrderService.create({ vehicleId: 1, customerId: 1 })).rejects.toThrow(
        BadRequestError,
      );
    });

    it('throws NotFoundError for missing customer', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(activeVehicle);
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(workOrderService.create({ vehicleId: 1, customerId: 999 })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('validates mechanic if provided', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(activeVehicle);
      mockPrisma.customer.findUnique.mockResolvedValue(activeCustomer);
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        workOrderService.create({ vehicleId: 1, customerId: 1, assignedMechanicId: 999 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── transitionStatus ──────────────────────────────────
  describe('transitionStatus', () => {
    it('transitions from PENDING to IN_PROGRESS', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);
      mockPrisma.workOrder.update.mockResolvedValue({ ...baseWorkOrder, status: 'IN_PROGRESS' });

      const result = await workOrderService.transitionStatus(1, 'IN_PROGRESS');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('rejects invalid transition PENDING -> COMPLETED', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);

      await expect(workOrderService.transitionStatus(1, 'COMPLETED')).rejects.toThrow(
        BadRequestError,
      );
    });

    it('calculates totals when completing', async () => {
      const inProgressWO = { ...baseWorkOrder, status: 'IN_PROGRESS' as const };
      mockPrisma.workOrder.findUnique.mockResolvedValue(inProgressWO);

      mockPrisma.workOrderService.aggregate.mockResolvedValue({
        _sum: { totalPrice: 150 },
      });
      mockPrisma.workOrderPart.aggregate.mockResolvedValue({
        _sum: { totalPrice: 75 },
      });

      mockPrisma.workOrder.update.mockResolvedValue({
        ...inProgressWO,
        status: 'COMPLETED',
        completionDate: new Date(),
      });

      await workOrderService.transitionStatus(1, 'COMPLETED');

      const updateCall = mockPrisma.workOrder.update.mock.calls[0][0] as any;
      expect(updateCall.data.completionDate).toBeDefined();
      expect(Number(updateCall.data.totalLaborCost)).toBe(150);
      expect(Number(updateCall.data.totalPartsCost)).toBe(75);
      expect(Number(updateCall.data.totalCost)).toBe(225);
    });
  });

  // ── addService (sub-resource) ─────────────────────────
  describe('addService', () => {
    it('adds a service to a pending work order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);
      mockPrisma.service.findUnique.mockResolvedValue({ id: 1, serviceName: 'Oil Change' });
      mockPrisma.workOrderService.create.mockResolvedValue({
        id: 1,
        workOrderId: 1,
        serviceId: 1,
        quantity: 1,
        unitPrice: 50,
        totalPrice: 50,
      });

      const result = await workOrderService.addService(1, {
        serviceId: 1,
        unitPrice: 50,
      });

      expect(result.serviceId).toBe(1);
    });

    it('refuses to add service to COMPLETED order', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue({
        ...baseWorkOrder,
        status: 'COMPLETED',
      });

      await expect(workOrderService.addService(1, { serviceId: 1, unitPrice: 50 })).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  // ── addPart (sub-resource with stock check) ───────────
  describe('addPart', () => {
    it('adds a part and deducts stock', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);
      mockPrisma.part.findUnique.mockResolvedValue({
        id: 1,
        partName: 'Filter',
        isActive: true,
        quantityInStock: 20,
      });

      const woPart = {
        id: 1,
        workOrderId: 1,
        partId: 1,
        quantity: 2,
        unitPrice: 10,
        totalPrice: 20,
      };
      mockPrisma.$transaction.mockResolvedValue([woPart, {}]);

      const result = await workOrderService.addPart(1, {
        partId: 1,
        quantity: 2,
        unitPrice: 10,
      });

      expect(result.totalPrice).toBe(20);
    });

    it('rejects if insufficient stock', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);
      mockPrisma.part.findUnique.mockResolvedValue({
        id: 1,
        partName: 'Filter',
        isActive: true,
        quantityInStock: 1,
      });

      await expect(
        workOrderService.addPart(1, { partId: 1, quantity: 5, unitPrice: 10 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('rejects inactive part', async () => {
      mockPrisma.workOrder.findUnique.mockResolvedValue(baseWorkOrder);
      mockPrisma.part.findUnique.mockResolvedValue({
        id: 1,
        partName: 'Filter',
        isActive: false,
        quantityInStock: 20,
      });

      await expect(
        workOrderService.addPart(1, { partId: 1, quantity: 2, unitPrice: 10 }),
      ).rejects.toThrow(BadRequestError);
    });
  });
});
