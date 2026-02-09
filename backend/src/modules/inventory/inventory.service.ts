import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, ConflictError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreatePartDto,
  UpdatePartDto,
  AdjustStockDto,
  PartListQuery,
  PartWithSupplier,
  InventoryValueResponse,
} from './inventory.types';

/**
 * Inventory Service — business logic for parts / inventory management.
 */
class InventoryService {
  /**
   * Get paginated list of parts with optional filters.
   */
  async findAll(query: PartListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.PartWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }
    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.search) {
      where.OR = [
        { partName: { contains: query.search, mode: 'insensitive' } },
        { partNumber: { contains: query.search, mode: 'insensitive' } },
        { manufacturer: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.PartOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    // For low-stock, use raw SQL for column-to-column comparison
    if (query.lowStock) {
      const countResult = await prisma.$queryRaw<[{ count: bigint }]>(
        Prisma.sql`SELECT COUNT(*) as count FROM parts WHERE is_active = true AND quantity_in_stock <= reorder_level`,
      );
      const total = Number(countResult[0]?.count ?? 0);

      const rawParts = await prisma.$queryRaw<Array<{ part_id: number }>>(
        Prisma.sql`SELECT part_id FROM parts WHERE is_active = true AND quantity_in_stock <= reorder_level
                   ORDER BY quantity_in_stock ASC LIMIT ${limit} OFFSET ${skip}`,
      );

      const ids = rawParts.map((p) => p.part_id);
      const parts =
        ids.length > 0
          ? await prisma.part.findMany({
              where: { id: { in: ids } },
              orderBy: { quantityInStock: 'asc' },
              include: { supplier: { select: { id: true, supplierName: true } } },
            })
          : [];

      return { data: parts, meta: buildPaginationMeta(total, page, limit) };
    }

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { supplier: { select: { id: true, supplierName: true } } },
      }),
      prisma.part.count({ where }),
    ]);

    return { data: parts, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single part by ID with supplier info.
   */
  async findById(id: number): Promise<PartWithSupplier> {
    const part = await prisma.part.findUnique({
      where: { id },
      include: { supplier: true },
    });

    if (!part) {
      throw new NotFoundError('Part', id);
    }

    return part;
  }

  /**
   * Get low-stock parts (quantity_in_stock <= reorder_level).
   */
  async getLowStock() {
    const rawIds = await prisma.$queryRaw<Array<{ part_id: number }>>(
      Prisma.sql`SELECT part_id FROM parts WHERE is_active = true AND quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC`,
    );
    const ids = rawIds.map((r) => r.part_id);

    if (ids.length === 0) {
      return [];
    }

    return prisma.part.findMany({
      where: { id: { in: ids } },
      include: { supplier: { select: { id: true, supplierName: true } } },
      orderBy: { quantityInStock: 'asc' },
    });
  }

  /**
   * Get total inventory value (cost & retail).
   */
  async getInventoryValue(): Promise<InventoryValueResponse> {
    const result = await prisma.$queryRaw<
      [
        {
          total_cost: number | null;
          total_retail: number | null;
          total_parts: bigint;
          total_units: bigint | null;
        },
      ]
    >(
      Prisma.sql`SELECT
        COALESCE(SUM(quantity_in_stock * unit_cost), 0)::float AS total_cost,
        COALESCE(SUM(quantity_in_stock * selling_price), 0)::float AS total_retail,
        COUNT(*) AS total_parts,
        COALESCE(SUM(quantity_in_stock), 0) AS total_units
      FROM parts WHERE is_active = true`,
    );

    const row = result[0];
    return {
      totalCostValue: Math.round(Number(row?.total_cost ?? 0) * 100) / 100,
      totalRetailValue: Math.round(Number(row?.total_retail ?? 0) * 100) / 100,
      totalParts: Number(row?.total_parts ?? 0),
      totalUnits: Number(row?.total_units ?? 0),
    };
  }

  /**
   * Create a new part.
   */
  async create(data: CreatePartDto) {
    // Check part number uniqueness
    const existing = await prisma.part.findUnique({ where: { partNumber: data.partNumber } });
    if (existing) {
      throw new ConflictError('A part with this part number already exists');
    }

    // Validate supplier exists if provided
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier) {
        throw new NotFoundError('Supplier', data.supplierId);
      }
    }

    // Warn if selling price < unit cost (still allow it)
    return prisma.part.create({
      data: {
        ...data,
        unitCost: new Prisma.Decimal(data.unitCost),
        sellingPrice: new Prisma.Decimal(data.sellingPrice),
      },
      include: { supplier: { select: { id: true, supplierName: true } } },
    });
  }

  /**
   * Update an existing part.
   */
  async update(id: number, data: UpdatePartDto) {
    await this.findById(id);

    const updateData: Prisma.PartUpdateInput = { ...data };
    if (data.unitCost !== undefined) {
      updateData.unitCost = new Prisma.Decimal(data.unitCost);
    }
    if (data.sellingPrice !== undefined) {
      updateData.sellingPrice = new Prisma.Decimal(data.sellingPrice);
    }

    return prisma.part.update({
      where: { id },
      data: updateData,
      include: { supplier: { select: { id: true, supplierName: true } } },
    });
  }

  /**
   * Manual stock adjustment with reason.
   */
  async adjustStock(id: number, data: AdjustStockDto) {
    const part = await this.findById(id);

    const newQuantity = part.quantityInStock + data.adjustment;
    if (newQuantity < 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError(
        `Stock adjustment would result in negative quantity (current: ${part.quantityInStock}, adjustment: ${data.adjustment})`,
      );
    }

    return prisma.part.update({
      where: { id },
      data: { quantityInStock: newQuantity },
      include: { supplier: { select: { id: true, supplierName: true } } },
    });
  }

  /**
   * Soft-delete a part (set isActive = false).
   */
  async delete(id: number) {
    await this.findById(id);
    return prisma.part.update({ where: { id }, data: { isActive: false } });
  }
}

export const inventoryService = new InventoryService();
