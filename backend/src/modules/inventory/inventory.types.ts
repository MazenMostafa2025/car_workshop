import type { Part, Supplier } from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreatePartDto {
  partNumber: string;
  partName: string;
  description?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  quantityInStock?: number;
  reorderLevel?: number;
  unitCost: number;
  sellingPrice: number;
  supplierId?: number | null;
  location?: string | null;
}

export interface UpdatePartDto {
  partName?: string;
  description?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  quantityInStock?: number;
  reorderLevel?: number;
  unitCost?: number;
  sellingPrice?: number;
  supplierId?: number | null;
  location?: string | null;
  isActive?: boolean;
}

export interface AdjustStockDto {
  adjustment: number; // positive = add, negative = subtract
  reason: string;
}

// ── Query Filters ─────────────────────────────────────────

export interface PartListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  supplierId?: number;
  isActive?: boolean;
  lowStock?: boolean;
  sortBy?: 'partName' | 'partNumber' | 'quantityInStock' | 'sellingPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type PartResponse = Part;

export type PartWithSupplier = Part & {
  supplier: Supplier | null;
};

export interface InventoryValueResponse {
  totalCostValue: number;
  totalRetailValue: number;
  totalParts: number;
  totalUnits: number;
}
