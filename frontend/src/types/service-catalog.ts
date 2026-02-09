export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { services: number };
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  categoryId: number;
  basePrice: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
}
