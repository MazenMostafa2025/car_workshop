import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a Date object or ISO string to 'yyyy-MM-dd'.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Format a Date object or ISO string to 'yyyy-MM-dd HH:mm:ss'.
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Validate that a string is a valid date.
 */
export function isValidDate(dateStr: string): boolean {
  const parsed = parseISO(dateStr);
  return isValid(parsed);
}

/**
 * Get the start and end of a day (for date range queries).
 */
export function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
