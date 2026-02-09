import type { Supplier, Part } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreateSupplierDto {
  supplierName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierDto {
  supplierName?: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
}

// ── Query Filters ─────────────────────────────────────────

export interface SupplierListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'supplierName' | 'city' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type SupplierResponse = Supplier;

export type SupplierWithParts = Supplier & {
  parts: Part[];
};

export type SupplierWithCount = Supplier & {
  _count: { parts: number; purchaseOrders: number };
};
