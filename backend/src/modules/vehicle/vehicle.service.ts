import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, ConflictError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleListQuery,
  VehicleWithCustomer,
} from './vehicle.types';

/**
 * Vehicle Service — business logic for vehicle management.
 */
class VehicleService {
  /**
   * Get paginated list of vehicles with optional search & filters.
   */
  async findAll(query: VehicleListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.VehicleWhereInput = {};

    // Active filter
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Filter by customer
    if (query.customerId) {
      where.customerId = query.customerId;
    }

    // Filter by make
    if (query.make) {
      where.make = { contains: query.make, mode: 'insensitive' };
    }

    // Search across licensePlate, vin, make, model
    if (query.search) {
      where.OR = [
        { licensePlate: { contains: query.search, mode: 'insensitive' } },
        { vin: { contains: query.search, mode: 'insensitive' } },
        { make: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Sort
    const orderBy: Prisma.VehicleOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { customer: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { data: vehicles, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single vehicle by ID, including customer info.
   */
  async findById(id: number): Promise<VehicleWithCustomer> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle', id);
    }

    return vehicle;
  }

  /**
   * Create a new vehicle.
   */
  async create(data: CreateVehicleDto) {
    // Ensure customer exists and is active
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer', data.customerId);
    }

    if (!customer.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Cannot add a vehicle to an inactive customer');
    }

    // Check VIN uniqueness
    if (data.vin) {
      const existing = await prisma.vehicle.findUnique({ where: { vin: data.vin } });
      if (existing) {
        throw new ConflictError('A vehicle with this VIN already exists');
      }
    }

    // Check license plate uniqueness
    if (data.licensePlate) {
      const existing = await prisma.vehicle.findUnique({
        where: { licensePlate: data.licensePlate },
      });
      if (existing) {
        throw new ConflictError('A vehicle with this license plate already exists');
      }
    }

    return prisma.vehicle.create({
      data,
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /**
   * Update an existing vehicle.
   */
  async update(id: number, data: UpdateVehicleDto) {
    // Ensure vehicle exists
    await this.findById(id);

    // Check VIN uniqueness if changing
    if (data.vin) {
      const existing = await prisma.vehicle.findFirst({
        where: { vin: data.vin, NOT: { id } },
      });
      if (existing) {
        throw new ConflictError('A vehicle with this VIN already exists');
      }
    }

    // Check license plate uniqueness if changing
    if (data.licensePlate) {
      const existing = await prisma.vehicle.findFirst({
        where: { licensePlate: data.licensePlate, NOT: { id } },
      });
      if (existing) {
        throw new ConflictError('A vehicle with this license plate already exists');
      }
    }

    return prisma.vehicle.update({
      where: { id },
      data,
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /**
   * Soft-delete a vehicle (set isActive = false).
   */
  async delete(id: number) {
    await this.findById(id);
    return prisma.vehicle.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * Get service history for a specific vehicle.
   */
  async getServiceHistory(id: number) {
    // Ensure vehicle exists
    await this.findById(id);

    return prisma.workOrder.findMany({
      where: { vehicleId: id },
      orderBy: { orderDate: 'desc' },
      include: {
        workOrderServices: {
          include: { service: { select: { serviceName: true } } },
        },
        assignedMechanic: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
}

export const vehicleService = new VehicleService();
