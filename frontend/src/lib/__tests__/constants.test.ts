import { describe, it, expect } from "vitest";
import {
  WORK_ORDER_STATUS,
  WORK_ORDER_PRIORITY,
  INVOICE_STATUS,
  APPOINTMENT_STATUS,
  PO_STATUS,
  EMPLOYEE_ROLE,
  PAYMENT_METHOD,
  EXPENSE_CATEGORY,
  NAV_ITEMS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../constants";

describe("WORK_ORDER_STATUS", () => {
  it("has all expected statuses", () => {
    expect(Object.keys(WORK_ORDER_STATUS)).toEqual([
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]);
  });

  it("each status has label, color, dot", () => {
    for (const val of Object.values(WORK_ORDER_STATUS)) {
      expect(val).toHaveProperty("label");
      expect(val).toHaveProperty("color");
      expect(val).toHaveProperty("dot");
    }
  });
});

describe("WORK_ORDER_PRIORITY", () => {
  it("has LOW → URGENT", () => {
    expect(Object.keys(WORK_ORDER_PRIORITY)).toEqual([
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ]);
  });
});

describe("INVOICE_STATUS", () => {
  it("has UNPAID, PARTIALLY_PAID, PAID, OVERDUE", () => {
    expect(Object.keys(INVOICE_STATUS)).toEqual([
      "UNPAID",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
    ]);
  });
});

describe("APPOINTMENT_STATUS", () => {
  it("includes NO_SHOW", () => {
    expect(APPOINTMENT_STATUS).toHaveProperty("NO_SHOW");
  });

  it("has 6 statuses", () => {
    expect(Object.keys(APPOINTMENT_STATUS)).toHaveLength(6);
  });
});

describe("PO_STATUS", () => {
  it("has DRAFT, ORDERED, RECEIVED, CANCELLED", () => {
    expect(Object.keys(PO_STATUS)).toEqual([
      "DRAFT",
      "ORDERED",
      "RECEIVED",
      "CANCELLED",
    ]);
  });
});

describe("EMPLOYEE_ROLE", () => {
  it("has 4 roles", () => {
    expect(Object.keys(EMPLOYEE_ROLE)).toEqual([
      "ADMIN",
      "MANAGER",
      "MECHANIC",
      "RECEPTIONIST",
    ]);
  });
});

describe("PAYMENT_METHOD", () => {
  it("includes CASH and CREDIT_CARD", () => {
    expect(PAYMENT_METHOD.CASH).toBe("Cash");
    expect(PAYMENT_METHOD.CREDIT_CARD).toBe("Credit Card");
  });

  it("has 6 methods", () => {
    expect(Object.keys(PAYMENT_METHOD)).toHaveLength(6);
  });
});

describe("EXPENSE_CATEGORY", () => {
  it("includes RENT and OTHER", () => {
    expect(EXPENSE_CATEGORY.RENT).toBe("Rent");
    expect(EXPENSE_CATEGORY.OTHER).toBe("Other");
  });

  it("has 9 categories", () => {
    expect(Object.keys(EXPENSE_CATEGORY)).toHaveLength(9);
  });
});

describe("NAV_ITEMS", () => {
  it("contains Dashboard as first item", () => {
    expect(NAV_ITEMS[0].label).toBe("Dashboard");
    expect(NAV_ITEMS[0].href).toBe("/");
  });

  it("all items have label, href, icon", () => {
    for (const item of NAV_ITEMS) {
      expect(item.label).toBeTruthy();
      expect(item.href).toBeTruthy();
      expect(item.icon).toBeTruthy();
    }
  });

  it("role-restricted items specify roles array", () => {
    const restricted = NAV_ITEMS.filter((i) => i.roles);
    expect(restricted.length).toBeGreaterThan(0);
    for (const item of restricted) {
      expect(Array.isArray(item.roles)).toBe(true);
      expect(item.roles!.length).toBeGreaterThan(0);
    }
  });

  it("Dashboard has no roles (visible to all)", () => {
    expect(NAV_ITEMS[0].roles).toBeUndefined();
  });

  it("Reports restricted to ADMIN & MANAGER", () => {
    const reports = NAV_ITEMS.find((i) => i.label === "Reports");
    expect(reports?.roles).toEqual(["ADMIN", "MANAGER"]);
  });
});

describe("Pagination defaults", () => {
  it("DEFAULT_PAGE_SIZE is 20", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it("PAGE_SIZE_OPTIONS is [10, 20, 50, 100]", () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([10, 20, 50, 100]);
  });
});
