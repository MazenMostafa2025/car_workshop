import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

/** Merge Tailwind classes safely (dedup + override) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency: 1234.5 → "$1,234.50" */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

/** Format date: "2026-02-09T..." → "Feb 9, 2026" */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

/** Format date-time: "2026-02-09T14:30" → "Feb 9, 2026 2:30 PM" */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

/** Format relative: "2026-02-09T..." → "3 days ago" */
export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Get initials from name: "John Doe" → "JD", or ("John", "Doe") → "JD" */
export function getInitials(firstOrFull: string, lastName?: string): string {
  if (!firstOrFull) return "";
  if (lastName) {
    return `${firstOrFull.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  const parts = firstOrFull.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return parts[0]?.charAt(0)?.toUpperCase() ?? "";
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Format enum-style strings: "IN_PROGRESS" → "In Progress" */
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}
