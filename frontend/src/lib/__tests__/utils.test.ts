import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
  capitalize,
  formatStatus,
} from "../utils";

// ── cn (class-name merger) ──────────────────────────────
describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    const active = true;
    expect(cn("base", active && "text-blue-500")).toContain("text-blue-500");
  });

  it("handles undefined / false / null gracefully", () => {
    expect(cn("px-2", undefined, null, false)).toBe("px-2");
  });
});

// ── formatCurrency ──────────────────────────────────────
describe("formatCurrency", () => {
  it("formats number to USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("handles string input", () => {
    expect(formatCurrency("99.9")).toBe("$99.90");
  });

  it("handles large numbers", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatCurrency(10.999)).toBe("$11.00");
  });
});

// ── formatDate ──────────────────────────────────────────
describe("formatDate", () => {
  it("formats ISO string", () => {
    expect(formatDate("2026-02-09T14:30:00Z")).toBe("Feb 9, 2026");
  });

  it("formats Date object", () => {
    const d = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatDate(d)).toBe("Jan 15, 2024");
  });

  it("formats date-only string", () => {
    expect(formatDate("2025-12-25")).toBe("Dec 25, 2025");
  });
});

// ── formatDateTime ──────────────────────────────────────
describe("formatDateTime", () => {
  it("formats date and time", () => {
    // Use a fixed timezone offset to avoid flakiness
    const result = formatDateTime("2026-02-09T14:30:00");
    expect(result).toMatch(/Feb 9, 2026/);
    expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
  });

  it("formats Date object with time", () => {
    const d = new Date(2024, 5, 15, 9, 0); // Jun 15, 2024 9:00 AM
    const result = formatDateTime(d);
    expect(result).toContain("Jun 15, 2024");
    expect(result).toMatch(/9:00 AM/);
  });
});

// ── getInitials ─────────────────────────────────────────
describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns initials from first and last params", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
  });

  it("handles single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("handles three-word name (first + last)", () => {
    expect(getInitials("John Michael Doe")).toBe("JD");
  });

  it("uppercases initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("");
  });
});

// ── capitalize ──────────────────────────────────────────
describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("lowercases remaining letters", () => {
    expect(capitalize("HELLO")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("handles already-capitalized string", () => {
    expect(capitalize("World")).toBe("World");
  });
});

// ── formatStatus ────────────────────────────────────────
describe("formatStatus", () => {
  it("converts IN_PROGRESS → In Progress", () => {
    expect(formatStatus("IN_PROGRESS")).toBe("In Progress");
  });

  it("converts PENDING → Pending", () => {
    expect(formatStatus("PENDING")).toBe("Pending");
  });

  it("converts PARTIALLY_PAID → Partially Paid", () => {
    expect(formatStatus("PARTIALLY_PAID")).toBe("Partially Paid");
  });

  it("handles single word", () => {
    expect(formatStatus("COMPLETED")).toBe("Completed");
  });

  it("handles lowercase input", () => {
    expect(formatStatus("no_show")).toBe("No Show");
  });
});
