import type { Customer, Vehicle } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

// ── Query Filters ─────────────────────────────────────────

export interface CustomerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'firstName' | 'lastName' | 'dateRegistered' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type CustomerResponse = Customer;

export type CustomerWithVehicles = Customer & {
  vehicles: Vehicle[];
};
