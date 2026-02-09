/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, BadRequestError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type { CreatePaymentDto, PaymentListQuery, PaymentWithInvoice } from './payment.types';

/**
 * Payment Service — business logic for payment management.
 * Recording a payment updates the invoice's amount_paid, balance_due, and status.
 */
class PaymentService {
  async findAll(query: PaymentListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.PaymentWhereInput = {};

    if (query.invoiceId) {
      where.invoiceId = query.invoiceId;
    }
    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.dateFrom || query.dateTo) {
      where.paymentDate = {};
      if (query.dateFrom) {
        where.paymentDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.paymentDate.lte = new Date(query.dateTo);
      }
    }

    const orderBy: Prisma.PaymentOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              amountPaid: true,
              balanceDue: true,
              status: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data: payments, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: number): Promise<PaymentWithInvoice> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment', id);
    }
    return payment;
  }

  /**
   * Record a payment against an invoice (uses a transaction).
   */
  async create(data: CreatePaymentDto) {
    const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) {
      throw new NotFoundError('Invoice', data.invoiceId);
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestError('This invoice is already fully paid');
    }

    const balanceDue = Number(invoice.balanceDue);
    if (data.amount > balanceDue) {
      throw new BadRequestError(
        `Payment amount ($${data.amount}) exceeds balance due ($${balanceDue})`,
      );
    }

    const newAmountPaid = Number(invoice.amountPaid) + data.amount;
    const newBalanceDue = Math.round((Number(invoice.totalAmount) - newAmountPaid) * 100) / 100;

    // Determine new status
    let newStatus: InvoiceStatus = 'PARTIALLY_PAID';
    if (newBalanceDue <= 0) {
      newStatus = 'PAID';
    }

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: data.invoiceId,
          paymentDate: new Date(data.paymentDate),
          amount: new Prisma.Decimal(data.amount),
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber ?? null,
          notes: data.notes ?? null,
        },
        include: { invoice: true },
      }),
      prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          amountPaid: new Prisma.Decimal(newAmountPaid),
          balanceDue: new Prisma.Decimal(newBalanceDue),
          status: newStatus,
        },
      }),
    ]);

    return payment;
  }

  /**
   * Void / reverse a payment — restores invoice balance.
   */
  async delete(id: number) {
    const payment = await this.findById(id);
    const invoice = payment.invoice;

    const newAmountPaid = Number(invoice.amountPaid) - Number(payment.amount);
    const newBalanceDue = Math.round((Number(invoice.totalAmount) - newAmountPaid) * 100) / 100;

    let newStatus: InvoiceStatus = 'UNPAID';
    if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    await prisma.$transaction([
      prisma.payment.delete({ where: { id } }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: new Prisma.Decimal(newAmountPaid),
          balanceDue: new Prisma.Decimal(newBalanceDue),
          status: newStatus,
        },
      }),
    ]);
  }
}

export const paymentService = new PaymentService();
