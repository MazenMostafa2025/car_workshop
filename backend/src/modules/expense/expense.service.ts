import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseListQuery,
  ExpenseSummaryQuery,
} from './expense.types';

/**
 * Expense Service — business logic for expense management.
 */
class ExpenseService {
  async findAll(query: ExpenseListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.ExpenseWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.dateFrom || query.dateTo) {
      where.expenseDate = {};
      if (query.dateFrom) {
        where.expenseDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.expenseDate.lte = new Date(query.dateTo);
      }
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { vendor: { contains: query.search, mode: 'insensitive' } },
        { receiptNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { data: expenses, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: number) {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundError('Expense', id);
    }
    return expense;
  }

  async create(data: CreateExpenseDto) {
    return prisma.expense.create({
      data: {
        description: data.description,
        category: data.category,
        amount: new Prisma.Decimal(data.amount),
        expenseDate: new Date(data.expenseDate),
        vendor: data.vendor ?? null,
        receiptNumber: data.receiptNumber ?? null,
        notes: data.notes ?? null,
        paymentMethod: data.paymentMethod ?? null,
      },
    });
  }

  async update(id: number, data: UpdateExpenseDto) {
    await this.findById(id); // ensure exists

    return prisma.expense.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.expenseDate && { expenseDate: new Date(data.expenseDate) }),
        ...(data.vendor !== undefined && { vendor: data.vendor ?? null }),
        ...(data.receiptNumber !== undefined && { receiptNumber: data.receiptNumber ?? null }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod ?? null }),
      },
    });
  }

  async delete(id: number) {
    await this.findById(id);
    await prisma.expense.delete({ where: { id } });
  }

  /**
   * Summary — totals grouped by category for a date range.
   */
  async getSummary(query: ExpenseSummaryQuery) {
    const where: Prisma.ExpenseWhereInput = {};

    if (query.dateFrom || query.dateTo) {
      where.expenseDate = {};
      if (query.dateFrom) {
        where.expenseDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.expenseDate.lte = new Date(query.dateTo);
      }
    }

    const [grouped, totalAgg] = await Promise.all([
      prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const grandTotal = Number(totalAgg._sum.amount ?? 0);
    const count = totalAgg._count;

    const categories = grouped
      .map((g) => {
        const total = Number(g._sum.amount ?? 0);
        return {
          category: g.category,
          total: Math.round(total * 100) / 100,
          percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 10000) / 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      grandTotal: Math.round(grandTotal * 100) / 100,
      count,
      categories,
    };
  }
}

export const expenseService = new ExpenseService();
