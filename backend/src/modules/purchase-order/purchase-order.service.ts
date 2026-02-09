import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  AddPOItemDto,
  UpdatePOItemDto,
  ReceivePODto,
  PurchaseOrderListQuery,
  PurchaseOrderFull,
} from './purchase-order.types';

const FULL_INCLUDE = {
  supplier: true,
  items: {
    include: { part: true },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.PurchaseOrderInclude;

/**
 * Purchase Order Service — business logic for purchase orders.
 */
class PurchaseOrderService {
  async findAll(query: PurchaseOrderListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.PurchaseOrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.supplierId) {
      where.supplierId = query.supplierId;
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

    const orderBy: Prisma.PurchaseOrderOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          supplier: { select: { id: true, supplierName: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { data: orders, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: number): Promise<PurchaseOrderFull> {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });

    if (!po) {
      throw new NotFoundError('Purchase Order', id);
    }
    return po;
  }

  async create(data: CreatePurchaseOrderDto) {
    // Validate supplier
    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier) {
      throw new NotFoundError('Supplier', data.supplierId);
    }

    // Validate all parts exist (batch query instead of N+1)
    const partIds = data.items.map((item) => item.partId);
    const uniquePartIds = [...new Set(partIds)];
    const foundParts = await prisma.part.findMany({
      where: { id: { in: uniquePartIds } },
      select: { id: true },
    });
    const foundPartIds = new Set(foundParts.map((p) => p.id));
    for (const partId of uniquePartIds) {
      if (!foundPartIds.has(partId)) {
        throw new NotFoundError('Part', partId);
      }
    }

    // Calculate total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantityOrdered * item.unitCost,
      0,
    );

    return prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        orderDate: new Date(data.orderDate),
        expectedDeliveryDate: data.expectedDeliveryDate
          ? new Date(data.expectedDeliveryDate)
          : null,
        notes: data.notes ?? null,
        totalAmount: new Prisma.Decimal(totalAmount),
        items: {
          create: data.items.map((item) => ({
            partId: item.partId,
            quantityOrdered: item.quantityOrdered,
            unitCost: new Prisma.Decimal(item.unitCost),
            totalCost: new Prisma.Decimal(item.quantityOrdered * item.unitCost),
          })),
        },
      },
      include: FULL_INCLUDE,
    });
  }

  async update(id: number, data: UpdatePurchaseOrderDto) {
    const po = await this.findById(id);
    if (po.status !== 'ORDERED') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Can only update purchase orders with ORDERED status');
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        expectedDeliveryDate: data.expectedDeliveryDate
          ? new Date(data.expectedDeliveryDate)
          : data.expectedDeliveryDate,
        notes: data.notes,
      },
      include: FULL_INCLUDE,
    });
  }

  /**
   * Receive a PO — updates status, increments parts inventory.
   */
  async receive(id: number, data: ReceivePODto) {
    const po = await this.findById(id);
    if (po.status !== 'ORDERED') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Can only receive purchase orders with ORDERED status');
    }

    // Build transaction operations
    const operations: Prisma.PrismaPromise<unknown>[] = [];

    for (const item of po.items) {
      const receivedQty = data.items
        ? (data.items.find((i) => i.itemId === item.id)?.quantityReceived ?? item.quantityOrdered)
        : item.quantityOrdered;

      // Update PO item with received quantity
      operations.push(
        prisma.purchaseOrderItem.update({
          where: { id: item.id },
          data: { quantityReceived: receivedQty },
        }),
      );

      // Increment parts inventory
      operations.push(
        prisma.part.update({
          where: { id: item.partId },
          data: { quantityInStock: { increment: receivedQty } },
        }),
      );
    }

    // Update PO status
    operations.push(
      prisma.purchaseOrder.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          receivedDate: new Date(),
        },
      }),
    );

    await prisma.$transaction(operations);

    return this.findById(id);
  }

  // ── PO Items sub-resource ───────────────────────────────

  async addItem(poId: number, data: AddPOItemDto) {
    const po = await this.findById(poId);
    if (po.status !== 'ORDERED') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Can only add items to ORDERED purchase orders');
    }

    const part = await prisma.part.findUnique({ where: { id: data.partId } });
    if (!part) {
      throw new NotFoundError('Part', data.partId);
    }

    const totalCost = data.quantityOrdered * data.unitCost;

    return prisma.$transaction(async (tx) => {
      const item = await tx.purchaseOrderItem.create({
        data: {
          purchaseOrderId: poId,
          partId: data.partId,
          quantityOrdered: data.quantityOrdered,
          unitCost: new Prisma.Decimal(data.unitCost),
          totalCost: new Prisma.Decimal(totalCost),
        },
        include: { part: true },
      });

      // Recalculate PO total atomically
      const items = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: poId } });
      const total = items.reduce((sum, i) => sum + Number(i.totalCost), 0);
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { totalAmount: new Prisma.Decimal(total) },
      });

      return item;
    });
  }

  async updateItem(poId: number, itemId: number, data: UpdatePOItemDto) {
    const po = await this.findById(poId);
    if (po.status !== 'ORDERED') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Can only update items on ORDERED purchase orders');
    }

    const existing = await prisma.purchaseOrderItem.findFirst({
      where: { id: itemId, purchaseOrderId: poId },
    });
    if (!existing) {
      throw new NotFoundError('PurchaseOrderItem', itemId);
    }

    const qty = data.quantityOrdered ?? existing.quantityOrdered;
    const cost = data.unitCost !== undefined ? data.unitCost : Number(existing.unitCost);
    const totalCost = qty * cost;

    return prisma.$transaction(async (tx) => {
      const item = await tx.purchaseOrderItem.update({
        where: { id: itemId },
        data: {
          quantityOrdered: data.quantityOrdered,
          unitCost: data.unitCost !== undefined ? new Prisma.Decimal(data.unitCost) : undefined,
          totalCost: new Prisma.Decimal(totalCost),
        },
        include: { part: true },
      });

      // Recalculate PO total atomically
      const items = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: poId } });
      const total = items.reduce((sum, i) => sum + Number(i.totalCost), 0);
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { totalAmount: new Prisma.Decimal(total) },
      });

      return item;
    });
  }

  async removeItem(poId: number, itemId: number) {
    const po = await this.findById(poId);
    if (po.status !== 'ORDERED') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new BadRequestError('Can only remove items from ORDERED purchase orders');
    }

    const existing = await prisma.purchaseOrderItem.findFirst({
      where: { id: itemId, purchaseOrderId: poId },
    });
    if (!existing) {
      throw new NotFoundError('PurchaseOrderItem', itemId);
    }

    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.delete({ where: { id: itemId } });
      // Recalculate PO total atomically
      const items = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: poId } });
      const total = items.reduce((sum, i) => sum + Number(i.totalCost), 0);
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { totalAmount: new Prisma.Decimal(total) },
      });
    });
  }
}

export const purchaseOrderService = new PurchaseOrderService();
