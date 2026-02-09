export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  notes: string | null;
  isActive: boolean;
  dateRegistered: string;
  createdAt: string;
  updatedAt: string;
  vehicles?: Vehicle[];
  _count?: { vehicles: number; workOrders: number };
}

export interface Vehicle {
  id: number;
  customerId: number;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  licensePlate: string | null;
  color: string | null;
  mileage: number | null;
  engineType: string | null;
  transmissionType: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}
