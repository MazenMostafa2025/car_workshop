/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import { generateInvoiceNumber } from '@common/utils/invoice-number';
import type {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceListQuery,
  InvoiceFull,
} from './invoice.types';

const FULL_INCLUDE = {
  workOrder: true,
  customer: true,
  payments: { orderBy: { paymentDate: 'desc' as const } },
} satisfies Prisma.InvoiceInclude;

/**
 * Invoice Service — business logic for invoice management.
 */
class InvoiceService {
  async findAll(query: InvoiceListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.InvoiceWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.dateFrom || query.dateTo) {
      where.invoiceDate = {};
      if (query.dateFrom) {
        where.invoiceDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.invoiceDate.lte = new Date(query.dateTo);
      }
    }

    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          workOrder: { select: { id: true, status: true } },
          _count: { select: { payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { data: invoices, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: number): Promise<InvoiceFull> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });

    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }
    return invoice;
  }

  /**
   * Get outstanding (unpaid / partially paid) invoices (capped at 200).
   */
  async getOutstanding() {
    return prisma.invoice.findMany({
      where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        workOrder: { select: { id: true } },
      },
      orderBy: { invoiceDate: 'asc' },
      take: 200,
    });
  }

  /**
   * Generate an invoice from a completed work order.
   */
  async create(data: CreateInvoiceDto) {
    // Validate work order exists and is completed
    const wo = await prisma.workOrder.findUnique({ where: { id: data.workOrderId } });
    if (!wo) {
      throw new NotFoundError('Work Order', data.workOrderId);
    }
    if (wo.status !== 'COMPLETED') {
      throw new BadRequestError('Can only create invoices for completed work orders');
    }

    // Check 1:1 — no existing invoice for this work order
    const existing = await prisma.invoice.findUnique({ where: { workOrderId: data.workOrderId } });
    if (existing) {
      throw new ConflictError('An invoice already exists for this work order');
    }

    const subtotal = Number(wo.totalCost);
    const taxRate = data.taxRate ?? 0;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const discountAmount = data.discountAmount ?? 0;
    const totalAmount = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;
    const balanceDue = totalAmount; // no payments yet

    const invoiceNumber = await generateInvoiceNumber();

    return prisma.invoice.create({
      data: {
        workOrderId: data.workOrderId,
        customerId: wo.customerId,
        invoiceNumber,
        invoiceDate: new Date(),
        subtotal: new Prisma.Decimal(subtotal),
        taxAmount: new Prisma.Decimal(taxAmount),
        discountAmount: new Prisma.Decimal(discountAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
        balanceDue: new Prisma.Decimal(balanceDue),
        notes: data.notes ?? null,
      },
      include: FULL_INCLUDE,
    });
  }

  /**
   * Update invoice (tax, discount, due date, notes).
   * Recalculates totals.
   */
  async update(id: number, data: UpdateInvoiceDto) {
    const invoice = await this.findById(id);

    if (invoice.status === 'PAID') {
      throw new BadRequestError('Cannot modify a fully paid invoice');
    }

    const subtotal = Number(invoice.subtotal);
    const taxAmount = data.taxAmount !== undefined ? data.taxAmount : Number(invoice.taxAmount);
    const discountAmount =
      data.discountAmount !== undefined ? data.discountAmount : Number(invoice.discountAmount);
    const totalAmount = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;
    const amountPaid = Number(invoice.amountPaid);
    const balanceDue = Math.round((totalAmount - amountPaid) * 100) / 100;

    // Determine status
    let status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID';
    if (amountPaid >= totalAmount) {
      status = 'PAID';
    } else if (amountPaid > 0) {
      status = 'PARTIALLY_PAID';
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        taxAmount: new Prisma.Decimal(taxAmount),
        discountAmount: new Prisma.Decimal(discountAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
        balanceDue: new Prisma.Decimal(balanceDue),
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate,
        notes: data.notes,
        status,
      },
      include: FULL_INCLUDE,
    });
  }
}

export const invoiceService = new InvoiceService();
