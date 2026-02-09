import type { ServiceCategory, Service } from '@prisma/client';

// ── Category DTOs ─────────────────────────────────────────

export interface CreateCategoryDto {
  categoryName: string;
  description?: string | null;
}

export interface UpdateCategoryDto {
  categoryName?: string;
  description?: string | null;
}

// ── Service DTOs ──────────────────────────────────────────

export interface CreateServiceDto {
  categoryId?: number | null;
  serviceName: string;
  description?: string | null;
  estimatedDuration?: number | null;
  basePrice: number;
}

export interface UpdateServiceDto {
  categoryId?: number | null;
  serviceName?: string;
  description?: string | null;
  estimatedDuration?: number | null;
  basePrice?: number;
  isActive?: boolean;
}

// ── Query Filters ─────────────────────────────────────────

export interface ServiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  sortBy?: 'serviceName' | 'basePrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type CategoryResponse = ServiceCategory;

export type CategoryWithServices = ServiceCategory & {
  services: Service[];
};

export type ServiceResponse = Service;

export type ServiceWithCategory = Service & {
  category: ServiceCategory | null;
};
