export interface Part {
  id: number;
  name: string;
  partNumber: string | null;
  description: string | null;
  category: string | null;
  supplierId: number | null;
  unitCost: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  supplier?: { id: number; name: string };
}

export interface StockAdjustment {
  adjustmentType: "ADD" | "REMOVE" | "SET";
  quantity: number;
  reason: string;
}

export interface InventoryValue {
  totalCost: number;
  totalRetail: number;
}
