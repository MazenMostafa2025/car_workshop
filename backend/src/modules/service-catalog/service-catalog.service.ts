import { Prisma } from '@prisma/client';
import { prisma } from '@common/database/prisma';
import { NotFoundError } from '@common/errors';
import { parsePagination, buildPaginationMeta } from '@common/utils/pagination';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceListQuery,
  CategoryWithServices,
  ServiceWithCategory,
} from './service-catalog.types';

/**
 * Service Catalog Service — business logic for categories & services.
 */
class ServiceCatalogService {
  // ══════════════════════════════════════════════
  // CATEGORIES
  // ══════════════════════════════════════════════

  /**
   * List all categories (with service count).
   */
  async findAllCategories() {
    return prisma.serviceCategory.findMany({
      include: { _count: { select: { services: true } } },
      orderBy: { categoryName: 'asc' },
    });
  }

  /**
   * Get single category by ID with its services.
   */
  async findCategoryById(id: number): Promise<CategoryWithServices> {
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: { services: { where: { isActive: true }, orderBy: { serviceName: 'asc' } } },
    });

    if (!category) {
      throw new NotFoundError('ServiceCategory', id);
    }

    return category;
  }

  /**
   * Create a new category.
   */
  async createCategory(data: CreateCategoryDto) {
    return prisma.serviceCategory.create({ data });
  }

  /**
   * Update a category.
   */
  async updateCategory(id: number, data: UpdateCategoryDto) {
    await this.findCategoryById(id);
    return prisma.serviceCategory.update({ where: { id }, data });
  }

  /**
   * Delete a category (hard delete — only if it has no services).
   */
  async deleteCategory(id: number) {
    const category = await this.findCategoryById(id);

    if (category.services.length > 0) {
      throw new Error(
        'Cannot delete category that still has services. Reassign or remove them first.',
      );
    }

    return prisma.serviceCategory.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════
  // SERVICES
  // ══════════════════════════════════════════════

  /**
   * Get paginated list of services with optional search & category filter.
   */
  async findAllServices(query: ServiceListQuery) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Prisma.ServiceWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { serviceName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ServiceOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.service.count({ where }),
    ]);

    return { data: services, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single service by ID (with category).
   */
  async findServiceById(id: number): Promise<ServiceWithCategory> {
    const service = await prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!service) {
      throw new NotFoundError('Service', id);
    }

    return service;
  }

  /**
   * Create a new service.
   */
  async createService(data: CreateServiceDto) {
    // Validate category exists if provided
    if (data.categoryId) {
      await this.findCategoryById(data.categoryId);
    }

    return prisma.service.create({ data, include: { category: true } });
  }

  /**
   * Update a service.
   */
  async updateService(id: number, data: UpdateServiceDto) {
    await this.findServiceById(id);

    if (data.categoryId) {
      await this.findCategoryById(data.categoryId);
    }

    return prisma.service.update({ where: { id }, data, include: { category: true } });
  }

  /**
   * Soft-delete a service (set isActive = false).
   */
  async deleteService(id: number) {
    await this.findServiceById(id);
    return prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}

export const serviceCatalogService = new ServiceCatalogService();
