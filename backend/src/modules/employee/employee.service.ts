import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError, ConflictError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeListQuery } from './employee.types';

/**
 * Employee Service — business logic for employee management.
 */
class EmployeeService {
  /**
   * Get paginated list of employees with optional search & role filter.
   */
  async findAll(query: EmployeeListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.EmployeeWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.role) {
      where.role = { equals: query.role, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { specialization: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({ where, orderBy, skip, take: limit }),
      prisma.employee.count({ where }),
    ]);

    return { data: employees, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single employee by ID.
   */
  async findById(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    });

    if (!employee) {
      throw new NotFoundError('Employee', id);
    }

    return employee;
  }

  /**
   * Create a new employee.
   */
  async create(data: CreateEmployeeDto) {
    if (data.email) {
      const existing = await prisma.employee.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new ConflictError('An employee with this email already exists');
      }
    }

    return prisma.employee.create({ data });
  }

  /**
   * Update an existing employee.
   */
  async update(id: number, data: UpdateEmployeeDto) {
    await this.findById(id);

    if (data.email) {
      const existing = await prisma.employee.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictError('An employee with this email already exists');
      }
    }

    return prisma.employee.update({ where: { id }, data });
  }

  /**
   * Soft-delete an employee (set isActive = false).
   */
  async delete(id: number) {
    await this.findById(id);
    return prisma.employee.update({ where: { id }, data: { isActive: false } });
  }
}

export const employeeService = new EmployeeService();
