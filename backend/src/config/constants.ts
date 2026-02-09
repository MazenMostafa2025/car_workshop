// ============================================
// Application-Wide Constants
// ============================================

/**
 * Work Order status values and allowed transitions.
 */
export const WORK_ORDER_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const WORK_ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Work Order priority levels (ordered by urgency).
 */
export const WORK_ORDER_PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
};

/**
 * Invoice status values.
 */
export const INVOICE_STATUS = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

/**
 * Appointment status values and allowed transitions.
 */
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const APPOINTMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

/**
 * Purchase Order status values.
 */
export const PURCHASE_ORDER_STATUS = {
  ORDERED: 'ORDERED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * User roles.
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MECHANIC: 'MECHANIC',
  RECEPTIONIST: 'RECEPTIONIST',
} as const;

/**
 * Employee roles (business-level, displayed in the employee record).
 */
export const EMPLOYEE_ROLES = [
  'Mechanic',
  'Manager',
  'Receptionist',
  'Technician',
  'Service Advisor',
] as const;

/**
 * Payment methods.
 */
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHECK: 'CHECK',
} as const;

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Auth constants.
 */
export const AUTH = {
  SALT_ROUNDS: 12,
  TOKEN_TYPE: 'Bearer',
} as const;

/**
 * Expense categories.
 */
export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Tools',
  'Insurance',
  'Salaries',
  'Marketing',
  'Office Supplies',
  'Vehicle Expenses',
  'Maintenance',
  'Other',
] as const;
