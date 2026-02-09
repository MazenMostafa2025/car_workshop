import { Prisma, WorkOrderStatus } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import {
  ALLOWED_TRANSITIONS,
  type CreateWorkOrderDto,
  type UpdateWorkOrderDto,
  type AddWorkOrderServiceDto,
  type UpdateWorkOrderServiceDto,
  type AddWorkOrderPartDto,
  type UpdateWorkOrderPartDto,
  type WorkOrderListQuery,
  type WorkOrderFull,
} from './work-order.types';

// ── Full include for work order detail ────────────────────

const FULL_INCLUDE = {
  vehicle: true,
  customer: true,
  assignedMechanic: true,
  workOrderServices: {
    include: { service: true, mechanic: true },
    orderBy: { createdAt: 'asc' as const },
  },
  workOrderParts: {
    include: { part: true },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.WorkOrderInclude;

/**
 * Work Order Service — core business logic for work orders,
 * including sub-resources (services, parts) and status transitions.
 */
class WorkOrderService {
  // ────────────────────────────────────────────────────────
  //  WORK ORDER CRUD
  // ────────────────────────────────────────────────────────

  async findAll(query: WorkOrderListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.WorkOrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }
    if (query.mechanicId) {
      where.assignedMechanicId = query.mechanicId;
    }

    if (query.dateFrom || query.dateTo) {
      where.orderDate = {};
      if (query.dateFrom) {
        where.orderDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.orderDate.lte = new Date(query.dateTo);
      }
    }

    const orderBy: Prisma.WorkOrderOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, make: true, model: true, year: true, licensePlate: true },
          },
          customer: { select: { id: true, firstName: true, lastName: true } },
          assignedMechanic: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { workOrderServices: true, workOrderParts: true } },
        },
      }),
      prisma.workOrder.count({ where }),
    ]);

    return { data: workOrders, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: number): Promise<WorkOrderFull> {
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });

    if (!wo) {
      throw new NotFoundError('Work Order', id);
    }
    return wo;
  }

  async create(data: CreateWorkOrderDto) {
    // Validate vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      throw new NotFoundError('Vehicle', data.vehicleId);
    }
    if (!vehicle.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Cannot create work order for inactive vehicle');
    }

    // Validate customer exists
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundError('Customer', data.customerId);
    }

    // Validate mechanic if provided
    if (data.assignedMechanicId) {
      const mechanic = await prisma.employee.findUnique({ where: { id: data.assignedMechanicId } });
      if (!mechanic) {
        throw new NotFoundError('Employee', data.assignedMechanicId);
      }
      if (!mechanic.isActive) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        throw new BadRequestError('Cannot assign work order to inactive mechanic');
      }
    }

    return prisma.workOrder.create({
      data: {
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        assignedMechanicId: data.assignedMechanicId ?? null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        priority: data.priority ?? 'NORMAL',
        customerComplaint: data.customerComplaint ?? null,
        diagnosis: data.diagnosis ?? null,
        mileageIn: data.mileageIn ?? null,
      },
      include: FULL_INCLUDE,
    });
  }

  async update(id: number, data: UpdateWorkOrderDto) {
    const wo = await this.findById(id);
    this.ensureModifiable(wo.status);

    if (data.assignedMechanicId) {
      const mechanic = await prisma.employee.findUnique({ where: { id: data.assignedMechanicId } });
      if (!mechanic) {
        throw new NotFoundError('Employee', data.assignedMechanicId);
      }
    }

    return prisma.workOrder.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : data.scheduledDate,
      },
      include: FULL_INCLUDE,
    });
  }

  // ────────────────────────────────────────────────────────
  //  STATUS TRANSITIONS
  // ────────────────────────────────────────────────────────

  async transitionStatus(id: number, newStatus: WorkOrderStatus) {
    const wo = await this.findById(id);

    const allowed = ALLOWED_TRANSITIONS[wo.status];
    if (!allowed.includes(newStatus)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError(
        `Cannot transition from ${wo.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    const updateData: Prisma.WorkOrderUpdateInput = { status: newStatus };

    // If completing, recalculate totals and set completion date — inside a transaction
    if (newStatus === 'COMPLETED') {
      return prisma.$transaction(async (tx) => {
        const [laborAgg, partsAgg] = await Promise.all([
          tx.workOrderService.aggregate({
            where: { workOrderId: id },
            _sum: { totalPrice: true },
          }),
          tx.workOrderPart.aggregate({
            where: { workOrderId: id },
            _sum: { totalPrice: true },
          }),
        ]);

        const totalLaborCost = Number(laborAgg._sum.totalPrice ?? 0);
        const totalPartsCost = Number(partsAgg._sum.totalPrice ?? 0);

        return tx.workOrder.update({
          where: { id },
          data: {
            status: newStatus,
            completionDate: new Date(),
            totalLaborCost: new Prisma.Decimal(totalLaborCost),
            totalPartsCost: new Prisma.Decimal(totalPartsCost),
            totalCost: new Prisma.Decimal(totalLaborCost + totalPartsCost),
          },
          include: FULL_INCLUDE,
        });
      });
    }

    return prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: FULL_INCLUDE,
    });
  }

  // ────────────────────────────────────────────────────────
  //  WORK ORDER SERVICES (sub-resource)
  // ────────────────────────────────────────────────────────

  async getServices(workOrderId: number) {
    await this.findById(workOrderId);
    return prisma.workOrderService.findMany({
      where: { workOrderId },
      include: { service: true, mechanic: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addService(workOrderId: number, data: AddWorkOrderServiceDto) {
    const wo = await this.findById(workOrderId);
    this.ensureModifiable(wo.status);

    // Validate service exists
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) {
      throw new NotFoundError('Service', data.serviceId);
    }

    if (data.mechanicId) {
      const mechanic = await prisma.employee.findUnique({ where: { id: data.mechanicId } });
      if (!mechanic) {
        throw new NotFoundError('Employee', data.mechanicId);
      }
    }

    const quantity = data.quantity ?? 1;
    const totalPrice = quantity * data.unitPrice;

    return prisma.workOrderService.create({
      data: {
        workOrderId,
        serviceId: data.serviceId,
        mechanicId: data.mechanicId ?? null,
        quantity,
        unitPrice: new Prisma.Decimal(data.unitPrice),
        laborHours: data.laborHours ? new Prisma.Decimal(data.laborHours) : null,
        totalPrice: new Prisma.Decimal(totalPrice),
        notes: data.notes ?? null,
      },
      include: { service: true, mechanic: true },
    });
  }

  async updateService(workOrderId: number, woServiceId: number, data: UpdateWorkOrderServiceDto) {
    const wo = await this.findById(workOrderId);
    this.ensureModifiable(wo.status);

    const existing = await prisma.workOrderService.findFirst({
      where: { id: woServiceId, workOrderId },
    });
    if (!existing) {
      throw new NotFoundError('WorkOrderService', woServiceId);
    }

    const quantity = data.quantity ?? existing.quantity;
    const unitPrice = data.unitPrice !== undefined ? data.unitPrice : Number(existing.unitPrice);
    const totalPrice = quantity * unitPrice;

    return prisma.workOrderService.update({
      where: { id: woServiceId },
      data: {
        ...data,
        unitPrice: data.unitPrice !== undefined ? new Prisma.Decimal(data.unitPrice) : undefined,
        laborHours:
          data.laborHours !== undefined
            ? data.laborHours
              ? new Prisma.Decimal(data.laborHours)
              : null
            : undefined,
        totalPrice: new Prisma.Decimal(totalPrice),
      },
      include: { service: true, mechanic: true },
    });
  }

  async removeService(workOrderId: number, woServiceId: number) {
    const wo = await this.findById(workOrderId);
    this.ensureModifiable(wo.status);

    const existing = await prisma.workOrderService.findFirst({
      where: { id: woServiceId, workOrderId },
    });
    if (!existing) {
      throw new NotFoundError('WorkOrderService', woServiceId);
    }

    return prisma.workOrderService.delete({ where: { id: woServiceId } });
  }

  // ────────────────────────────────────────────────────────
  //  WORK ORDER PARTS (sub-resource, with stock management)
  // ────────────────────────────────────────────────────────

  async getParts(workOrderId: number) {
    await this.findById(workOrderId);
    return prisma.workOrderPart.findMany({
      where: { workOrderId },
      include: { part: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addPart(workOrderId: number, data: AddWorkOrderPartDto) {
    const wo = await this.findById(workOrderId);
    this.ensureModifiable(wo.status);

    const part = await prisma.part.findUnique({ where: { id: data.partId } });
    if (!part) {
      throw new NotFoundError('Part', data.partId);
    }
    if (!part.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Cannot add inactive part to work order');
    }

    if (part.quantityInStock < data.quantity) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError(
        `Insufficient stock for "${part.partName}". Available: ${part.quantityInStock}, Requested: ${data.quantity}`,
      );
    }

    const totalPrice = data.quantity * data.unitPrice;

    // Use transaction to deduct stock and create work order part
    const [woPart] = await prisma.$transaction([
      prisma.workOrderPart.create({
        data: {
          workOrderId,
          partId: data.partId,
          quantity: data.quantity,
          unitPrice: new Prisma.Decimal(data.unitPrice),
          totalPrice: new Prisma.Decimal(totalPrice),
          notes: data.notes ?? null,
        },
        include: { part: true },
      }),
      prisma.part.update({
        where: { id: data.partId },
        data: { quantityInStock: { decrement: data.quantity } },
      }),
    ]);

    return woPart;
  }

  async updatePart(workOrderId: number, woPartId: number, data: UpdateWorkOrderPartDto) {
    const wo = await this.findById(workOrderId);
    this.ensureModifiable(wo.status);

    const existing = await prisma.workOrderPart.findFirst({
      where: { id: woPartId, workOrderId },
    });
    if (!existing) {
      throw new NotFoundError('WorkOrderPart', woPartId);
    }

    const newQuantity = data.quantity ?? existing.quantity;
    const unitPrice = data.unitPrice !== undefined ? data.unitPrice : Number(existing.unitPrice);
    const totalPrice = newQuantity * unitPrice;
    const quantityDiff = newQuantity - existing.quantity;

    // Check stock for increased quantity
    if (quantityDiff > 0) {
      const part = await prisma.part.findUnique({ where: { id: existing.partId } });
      if (part && part.quantityInStock < quantityDiff) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        throw new BadRequestError(
          `Insufficient stock. Available: ${part.quantityInStock}, Additional needed: ${quantityDiff}`,
        );
      }
    }

    // Transaction: update part line + adjust inventory
    const [woPart] = await prisma.$transaction([
      prisma.workOrderPart.update({
        where: { id: woPartId },
        data: {
          quantity: newQuantity,
          unitPrice: data.unitPrice !== undefined ? new Prisma.Decimal(data.unitPrice) : undefined,
          totalPrice: new Prisma.Decimal(totalPrice),
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: { part: true },
      }),
      // Adjust stock: positive diff = decrement, negative diff = increment
      ...(quantityDiff !== 0
        ? [
            prisma.part.update({
              where: { id: existing.partId },
              data: {
                quantityInStock:
                  quantityDiff > 0
                    ? { decrement: quantityDiff }
                    : { increment: Math.abs(quantityDiff) },
              },
            }),
          ]
        : []),
    ]);

    return woPart;
  }

  async removePart(workOrderId: number, woPartId: number) {
    const wo = await this.findById(workOrderId);
    this.ensureModifiable(wo.status);

    const existing = await prisma.workOrderPart.findFirst({
      where: { id: woPartId, workOrderId },
    });
    if (!existing) {
      throw new NotFoundError('WorkOrderPart', woPartId);
    }

    // Transaction: delete work order part + restore inventory
    await prisma.$transaction([
      prisma.workOrderPart.delete({ where: { id: woPartId } }),
      prisma.part.update({
        where: { id: existing.partId },
        data: { quantityInStock: { increment: existing.quantity } },
      }),
    ]);
  }

  // ────────────────────────────────────────────────────────
  //  HELPERS
  // ────────────────────────────────────────────────────────

  private ensureModifiable(status: WorkOrderStatus) {
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError(`Cannot modify a work order with status "${status}"`);
    }
  }
}

export const workOrderService = new WorkOrderService();
