import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, ConflictError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerListQuery,
  CustomerWithVehicles,
} from './customer.types';

/**
 * Customer Service — business logic for customer management.
 */
class CustomerService {
  /**
   * Get paginated list of customers with optional search & filters.
   */
  async findAll(query: CustomerListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.CustomerWhereInput = {};

    // Active filter
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Search across name, email, phone
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    // Sort
    const orderBy: Prisma.CustomerOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, orderBy, skip, take: limit }),
      prisma.customer.count({ where }),
    ]);

    return { data: customers, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single customer by ID, including their vehicles.
   */
  async findById(id: number): Promise<CustomerWithVehicles> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { vehicles: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
    });

    if (!customer) {
      throw new NotFoundError('Customer', id);
    }

    return customer;
  }

  /**
   * Create a new customer.
   */
  async create(data: CreateCustomerDto) {
    // Check for duplicate email if provided
    if (data.email) {
      const existing = await prisma.customer.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new ConflictError('A customer with this email already exists');
      }
    }

    return prisma.customer.create({ data });
  }

  /**
   * Update an existing customer.
   */
  async update(id: number, data: UpdateCustomerDto) {
    // Ensure customer exists
    await this.findById(id);

    // Check email uniqueness if changing
    if (data.email) {
      const existing = await prisma.customer.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictError('A customer with this email already exists');
      }
    }

    return prisma.customer.update({ where: { id }, data });
  }

  /**
   * Soft-delete a customer (set isActive = false).
   */
  async delete(id: number) {
    await this.findById(id);
    return prisma.customer.update({ where: { id }, data: { isActive: false } });
  }
}

export const customerService = new CustomerService();
