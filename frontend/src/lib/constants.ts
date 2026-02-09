// ============================================
// STATUS LABELS & COLORS
// ============================================

export const WORK_ORDER_STATUS = {
  PENDING: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700",
    dot: "bg-gray-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
} as const;

export const WORK_ORDER_PRIORITY = {
  LOW: { label: "Low", color: "bg-green-100 text-green-700" },
  NORMAL: { label: "Normal", color: "bg-yellow-100 text-yellow-700" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-700" },
} as const;

export const INVOICE_STATUS = {
  UNPAID: { label: "Unpaid", color: "bg-red-100 text-red-700" },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    color: "bg-amber-100 text-amber-700",
  },
  PAID: { label: "Paid", color: "bg-green-100 text-green-700" },
  OVERDUE: { label: "Overdue", color: "bg-orange-100 text-orange-700" },
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "No Show", color: "bg-gray-100 text-gray-700" },
} as const;

export const PO_STATUS = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  ORDERED: { label: "Ordered", color: "bg-blue-100 text-blue-700" },
  RECEIVED: { label: "Received", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
} as const;

export const EMPLOYEE_ROLE = {
  ADMIN: { label: "Admin" },
  MANAGER: { label: "Manager" },
  MECHANIC: { label: "Mechanic" },
  RECEPTIONIST: { label: "Receptionist" },
} as const;

export const PAYMENT_METHOD = {
  CASH: "Cash",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  BANK_TRANSFER: "Bank Transfer",
  CHECK: "Check",
  OTHER: "Other",
} as const;

export const EXPENSE_CATEGORY = {
  RENT: "Rent",
  UTILITIES: "Utilities",
  SALARIES: "Salaries",
  EQUIPMENT: "Equipment",
  SUPPLIES: "Supplies",
  INSURANCE: "Insurance",
  MARKETING: "Marketing",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
} as const;

// ============================================
// NAVIGATION
// ============================================

export type NavItem = {
  label: string;
  href: string;
  icon: string; // lucide icon name
  roles?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  {
    label: "Customers",
    href: "/customers",
    icon: "Users",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: "Car",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: "HardHat",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Services",
    href: "/services",
    icon: "Wrench",
    roles: ["ADMIN", "MANAGER"],
  },
  { label: "Work Orders", href: "/work-orders", icon: "ClipboardList" },
  {
    label: "Appointments",
    href: "/appointments",
    icon: "CalendarDays",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "Package",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: "Factory",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Purchase Orders",
    href: "/purchase-orders",
    icon: "ShoppingCart",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: "FileText",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: "Receipt",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart3",
    roles: ["ADMIN", "MANAGER"],
  },
];

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
