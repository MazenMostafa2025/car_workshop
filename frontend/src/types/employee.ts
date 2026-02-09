import { UserRole } from "./auth";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  specialization: string | null;
  hireDate: string;
  hourlyRate: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { workOrdersAsMechanic: number };
}
