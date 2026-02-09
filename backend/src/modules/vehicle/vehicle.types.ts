import type { Vehicle, Customer } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateVehicleDto {
  customerId: number;
  make: string;
  model: string;
  year: number;
  vin?: string | null;
  licensePlate?: string | null;
  color?: string | null;
  mileage?: number | null;
  engineType?: string | null;
  transmissionType?: string | null;
  notes?: string | null;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  year?: number;
  vin?: string | null;
  licensePlate?: string | null;
  color?: string | null;
  mileage?: number | null;
  engineType?: string | null;
  transmissionType?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

// ── Query Filters ─────────────────────────────────────────

export interface VehicleListQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number;
  make?: string;
  isActive?: boolean;
  sortBy?: 'make' | 'model' | 'year' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type VehicleResponse = Vehicle;

export type VehicleWithCustomer = Vehicle & {
  customer: Pick<Customer, 'id' | 'firstName' | 'lastName' | 'phone' | 'email'>;
};
