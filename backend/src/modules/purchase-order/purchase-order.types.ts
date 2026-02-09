import type {
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  Part,
  PurchaseOrderStatus,
} from '@prisma/client';

// ── DTOs ──────────────────────────────────────────────────

export interface CreatePurchaseOrderDto {
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  items: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
  partId: number;
  quantityOrdered: number;
  unitCost: number;
}

export interface UpdatePurchaseOrderDto {
  expectedDeliveryDate?: string | null;
  notes?: string | null;
}

export interface AddPOItemDto {
  partId: number;
  quantityOrdered: number;
  unitCost: number;
}

export interface UpdatePOItemDto {
  quantityOrdered?: number;
  unitCost?: number;
}

export interface ReceivePODto {
  items?: { itemId: number; quantityReceived: number }[];
}

// ── Query Filters ─────────────────────────────────────────

export interface PurchaseOrderListQuery {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'orderDate' | 'expectedDeliveryDate' | 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Responses ─────────────────────────────────────────────

export type PurchaseOrderFull = PurchaseOrder & {
  supplier: Supplier;
  items: (PurchaseOrderItem & { part: Part })[];
};
