export interface PurchaseOrder {
  id: number;
  supplierId: number;
  status: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  receivedDate: string | null;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: { id: number; name: string };
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  partId: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  part?: { id: number; name: string; partNumber: string | null };
}
