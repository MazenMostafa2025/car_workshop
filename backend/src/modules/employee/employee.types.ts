import type { Employee } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  specialization?: string | null;
  hireDate: Date;
  hourlyRate?: number | null;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  specialization?: string | null;
  hireDate?: Date;
  hourlyRate?: number | null;
  isActive?: boolean;
}

// ── Query Filters ─────────────────────────────────────────

export interface EmployeeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: 'firstName' | 'lastName' | 'hireDate' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type EmployeeResponse = Employee;
