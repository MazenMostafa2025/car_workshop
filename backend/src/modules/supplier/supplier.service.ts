import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierListQuery,
  SupplierWithParts,
} from './supplier.types';

/**
 * Supplier Service — business logic for supplier management.
 */
class SupplierService {
  /**
   * Get paginated list of suppliers with optional search.
   */
  async findAll(query: SupplierListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.SupplierWhereInput = {};

    // Search across name, contact person, email, phone
    if (query.search) {
      where.OR = [
        { supplierName: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    // Sort
    const orderBy: Prisma.SupplierOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { parts: true, purchaseOrders: true } },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { data: suppliers, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single supplier by ID, including parts count.
   */
  async findById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: { select: { parts: true, purchaseOrders: true } },
      },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier', id);
    }

    return supplier;
  }

  /**
   * Get a supplier's parts list.
   */
  async findParts(id: number): Promise<SupplierWithParts> {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        parts: {
          where: { isActive: true },
          orderBy: { partName: 'asc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier', id);
    }

    return supplier;
  }

  /**
   * Create a new supplier.
   */
  async create(data: CreateSupplierDto) {
    return prisma.supplier.create({ data });
  }

  /**
   * Update an existing supplier.
   */
  async update(id: number, data: UpdateSupplierDto) {
    await this.findById(id);
    return prisma.supplier.update({ where: { id }, data });
  }

  /**
   * Delete a supplier (hard delete — only if no parts linked).
   */
  async delete(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { parts: true } } },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier', id);
    }

    if (supplier._count.parts > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError(
        `Cannot delete supplier with ${supplier._count.parts} linked part(s). Re-assign or remove parts first.`,
      );
    }

    return prisma.supplier.delete({ where: { id } });
  }
}

export const supplierService = new SupplierService();
