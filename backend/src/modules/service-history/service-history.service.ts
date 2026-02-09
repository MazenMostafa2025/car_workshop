import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type { ServiceHistoryQuery, VehicleHistoryQuery } from './service-history.types';

/**
 * Full include for a work order used as a service history record.
 */
const HISTORY_INCLUDE = {
  vehicle: {
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
      vin: true,
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  },
  assignedMechanic: { select: { id: true, firstName: true, lastName: true } },
  workOrderServices: {
    include: {
      service: {
        select: {
          id: true,
          serviceName: true,
          category: { select: { id: true, categoryName: true } },
        },
      },
    },
  },
  workOrderParts: {
    include: {
      part: { select: { id: true, partName: true, partNumber: true } },
    },
  },
  invoice: {
    select: { id: true, invoiceNumber: true, totalAmount: true, status: true },
  },
} as const;

/**
 * Service History Service — read-only queries for completed/historical work orders.
 */
class ServiceHistoryService {
  /**
   * List all work orders (service history) with filtering.
   */
  async findAll(query: ServiceHistoryQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.WorkOrderWhereInput = {};

    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }
    if (query.customerId) {
      where.vehicle = { customerId: query.customerId };
    }
    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    const orderBy: Prisma.WorkOrderOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [records, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: HISTORY_INCLUDE,
      }),
      prisma.workOrder.count({ where }),
    ]);

    return { data: records, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get full service history for a specific vehicle.
   */
  async findByVehicle(vehicleId: number, query: VehicleHistoryQuery) {
    // Ensure vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new NotFoundError('Vehicle', vehicleId);
    }

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.WorkOrderWhereInput = { vehicleId };

    const [records, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: HISTORY_INCLUDE,
      }),
      prisma.workOrder.count({ where }),
    ]);

    // Build summary
    const completedOrders = await prisma.workOrder.findMany({
      where: { vehicleId, status: 'COMPLETED' },
      select: { totalCost: true },
    });
    const totalSpent = completedOrders.reduce((sum, wo) => sum + Number(wo.totalCost), 0);

    return {
      data: records,
      meta: buildPaginationMeta(total, page, limit),
      summary: {
        totalWorkOrders: total,
        completedWorkOrders: completedOrders.length,
        totalAmountSpent: Math.round(totalSpent * 100) / 100,
      },
    };
  }
}

export const serviceHistoryService = new ServiceHistoryService();
