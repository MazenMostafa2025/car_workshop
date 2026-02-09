import { describe, it, expect } from "vitest";
import { customerSchema } from "../validations/customer";
import { vehicleSchema } from "../validations/vehicle";
import { employeeSchema } from "../validations/employee";
import { serviceSchema, serviceCategorySchema } from "../validations/service";
import { expenseSchema } from "../validations/expense";
import { appointmentSchema } from "../validations/appointment";
import { supplierSchema } from "../validations/supplier";
import {
  workOrderSchema,
  workOrderServiceSchema,
  workOrderPartSchema,
} from "../validations/work-order";
import { invoiceSchema, paymentSchema } from "../validations/invoice";
import {
  purchaseOrderSchema,
  purchaseOrderItemSchema,
} from "../validations/purchase-order";
import { partSchema, stockAdjustmentSchema } from "../validations/inventory";

// ── Customer ────────────────────────────────────────────
describe("customerSchema", () => {
  const valid = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-1234",
    address: "123 Main St",
    city: "Springfield",
    postalCode: "12345",
    notes: "",
  };

  it("accepts valid data", () => {
    expect(customerSchema.safeParse(valid).success).toBe(true);
  });

  it("requires firstName", () => {
    const r = customerSchema.safeParse({ ...valid, firstName: "" });
    expect(r.success).toBe(false);
  });

  it("requires lastName", () => {
    const r = customerSchema.safeParse({ ...valid, lastName: "" });
    expect(r.success).toBe(false);
  });

  it("requires phone", () => {
    const r = customerSchema.safeParse({ ...valid, phone: "" });
    expect(r.success).toBe(false);
  });

  it("allows empty email or valid email", () => {
    expect(customerSchema.safeParse({ ...valid, email: "" }).success).toBe(
      true,
    );
    expect(customerSchema.safeParse({ ...valid, email: "bad" }).success).toBe(
      false,
    );
  });

  it("limits firstName to 100 chars", () => {
    const r = customerSchema.safeParse({
      ...valid,
      firstName: "a".repeat(101),
    });
    expect(r.success).toBe(false);
  });
});

// ── Vehicle ─────────────────────────────────────────────
describe("vehicleSchema", () => {
  const valid = {
    customerId: 1,
    make: "Toyota",
    model: "Camry",
    year: 2022,
    vin: "12345678901234567",
    licensePlate: "ABC-123",
    color: "Black",
    mileage: 50000,
    engineType: "V6",
    transmissionType: "Automatic",
  };

  it("accepts valid data", () => {
    expect(vehicleSchema.safeParse(valid).success).toBe(true);
  });

  it("requires customerId > 0", () => {
    expect(vehicleSchema.safeParse({ ...valid, customerId: 0 }).success).toBe(
      false,
    );
  });

  it("requires make", () => {
    expect(vehicleSchema.safeParse({ ...valid, make: "" }).success).toBe(false);
  });

  it("requires model", () => {
    expect(vehicleSchema.safeParse({ ...valid, model: "" }).success).toBe(
      false,
    );
  });

  it("rejects year < 1900", () => {
    expect(vehicleSchema.safeParse({ ...valid, year: 1800 }).success).toBe(
      false,
    );
  });

  it("rejects year > current + 2", () => {
    const futureYear = new Date().getFullYear() + 3;
    expect(
      vehicleSchema.safeParse({ ...valid, year: futureYear }).success,
    ).toBe(false);
  });

  it("accepts mileage as optional", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mileage: _unused, ...rest } = valid;
    expect(vehicleSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects negative mileage", () => {
    expect(vehicleSchema.safeParse({ ...valid, mileage: -1 }).success).toBe(
      false,
    );
  });
});

// ── Employee ────────────────────────────────────────────
describe("employeeSchema", () => {
  const valid = {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@workshop.com",
    phone: "555-9876",
    role: "MECHANIC" as const,
    specialization: "Engine",
    hireDate: "2024-01-15",
    hourlyRate: 35,
    password: "secret123",
  };

  it("accepts valid data", () => {
    expect(employeeSchema.safeParse(valid).success).toBe(true);
  });

  it("requires valid email", () => {
    expect(employeeSchema.safeParse({ ...valid, email: "bad" }).success).toBe(
      false,
    );
  });

  it("accepts valid roles", () => {
    for (const role of ["ADMIN", "MANAGER", "MECHANIC", "RECEPTIONIST"]) {
      expect(employeeSchema.safeParse({ ...valid, role }).success).toBe(true);
    }
  });

  it("rejects invalid role", () => {
    expect(employeeSchema.safeParse({ ...valid, role: "INTERN" }).success).toBe(
      false,
    );
  });

  it("requires hireDate", () => {
    expect(employeeSchema.safeParse({ ...valid, hireDate: "" }).success).toBe(
      false,
    );
  });

  it("allows empty password (for updates)", () => {
    expect(employeeSchema.safeParse({ ...valid, password: "" }).success).toBe(
      true,
    );
  });

  it("rejects password < 6 chars (non-empty)", () => {
    expect(
      employeeSchema.safeParse({ ...valid, password: "abc" }).success,
    ).toBe(false);
  });
});

// ── Service Category ────────────────────────────────────
describe("serviceCategorySchema", () => {
  it("accepts valid data", () => {
    expect(
      serviceCategorySchema.safeParse({ name: "Engine", description: "" })
        .success,
    ).toBe(true);
  });

  it("requires name", () => {
    expect(
      serviceCategorySchema.safeParse({ name: "", description: "" }).success,
    ).toBe(false);
  });

  it("limits description to 500 chars", () => {
    expect(
      serviceCategorySchema.safeParse({
        name: "X",
        description: "a".repeat(501),
      }).success,
    ).toBe(false);
  });
});

// ── Service ─────────────────────────────────────────────
describe("serviceSchema", () => {
  const valid = {
    name: "Oil Change",
    description: "",
    categoryId: 1,
    basePrice: 49.99,
    estimatedDuration: 30,
    isActive: true,
  };

  it("accepts valid data", () => {
    expect(serviceSchema.safeParse(valid).success).toBe(true);
  });

  it("requires name", () => {
    expect(serviceSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("requires categoryId > 0", () => {
    expect(serviceSchema.safeParse({ ...valid, categoryId: 0 }).success).toBe(
      false,
    );
  });

  it("requires basePrice ≥ 0", () => {
    expect(serviceSchema.safeParse({ ...valid, basePrice: -1 }).success).toBe(
      false,
    );
  });

  it("requires estimatedDuration ≥ 1", () => {
    expect(
      serviceSchema.safeParse({ ...valid, estimatedDuration: 0 }).success,
    ).toBe(false);
  });
});

// ── Expense ─────────────────────────────────────────────
describe("expenseSchema", () => {
  const valid = {
    category: "RENT",
    amount: 1500,
    vendor: "Landlord",
    description: "",
    expenseDate: "2024-06-01",
    reference: "",
  };

  it("accepts valid data", () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true);
  });

  it("requires positive amount", () => {
    expect(expenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(
      false,
    );
  });

  it("requires expenseDate", () => {
    expect(expenseSchema.safeParse({ ...valid, expenseDate: "" }).success).toBe(
      false,
    );
  });

  it("requires category", () => {
    expect(expenseSchema.safeParse({ ...valid, category: "" }).success).toBe(
      false,
    );
  });
});

// ── Appointment ─────────────────────────────────────────
describe("appointmentSchema", () => {
  const valid = {
    customerId: 1,
    vehicleId: null,
    assignedMechanicId: null,
    serviceType: "Oil Change",
    scheduledDate: "2024-06-15",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
  };

  it("accepts valid data", () => {
    expect(appointmentSchema.safeParse(valid).success).toBe(true);
  });

  it("requires customerId", () => {
    expect(
      appointmentSchema.safeParse({ ...valid, customerId: 0 }).success,
    ).toBe(false);
  });

  it("requires scheduledDate", () => {
    expect(
      appointmentSchema.safeParse({ ...valid, scheduledDate: "" }).success,
    ).toBe(false);
  });

  it("allows nullable vehicleId", () => {
    expect(
      appointmentSchema.safeParse({ ...valid, vehicleId: null }).success,
    ).toBe(true);
    expect(
      appointmentSchema.safeParse({ ...valid, vehicleId: 5 }).success,
    ).toBe(true);
  });
});

// ── Supplier ────────────────────────────────────────────
describe("supplierSchema", () => {
  const valid = {
    name: "AutoParts Inc",
    contactPerson: "Bob",
    email: "bob@autoparts.com",
    phone: "555-0000",
    address: "456 Industrial Rd",
    city: "Metro",
    postalCode: "67890",
    notes: "",
  };

  it("accepts valid data", () => {
    expect(supplierSchema.safeParse(valid).success).toBe(true);
  });

  it("requires name", () => {
    expect(supplierSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
  });

  it("allows empty email", () => {
    expect(supplierSchema.safeParse({ ...valid, email: "" }).success).toBe(
      true,
    );
  });

  it("rejects invalid email", () => {
    expect(supplierSchema.safeParse({ ...valid, email: "nope" }).success).toBe(
      false,
    );
  });
});

// ── Work Order ──────────────────────────────────────────
describe("workOrderSchema", () => {
  const valid = {
    customerId: 1,
    vehicleId: 1,
    assignedMechanicId: null,
    priority: "MEDIUM" as const,
    description: "Check engine light",
    diagnosis: "",
    estimatedCompletionDate: "2024-06-20",
    notes: "",
  };

  it("accepts valid data", () => {
    expect(workOrderSchema.safeParse(valid).success).toBe(true);
  });

  it("requires customerId > 0", () => {
    expect(workOrderSchema.safeParse({ ...valid, customerId: 0 }).success).toBe(
      false,
    );
  });

  it("requires vehicleId > 0", () => {
    expect(workOrderSchema.safeParse({ ...valid, vehicleId: 0 }).success).toBe(
      false,
    );
  });

  it("accepts valid priorities", () => {
    for (const p of ["LOW", "MEDIUM", "HIGH", "URGENT"]) {
      expect(workOrderSchema.safeParse({ ...valid, priority: p }).success).toBe(
        true,
      );
    }
  });

  it("rejects invalid priority", () => {
    expect(
      workOrderSchema.safeParse({ ...valid, priority: "CRITICAL" }).success,
    ).toBe(false);
  });
});

describe("workOrderServiceSchema", () => {
  it("accepts valid line item", () => {
    expect(
      workOrderServiceSchema.safeParse({
        serviceId: 1,
        mechanicId: null,
        quantity: 1,
        unitPrice: 50,
        notes: "",
      }).success,
    ).toBe(true);
  });

  it("requires quantity ≥ 1", () => {
    expect(
      workOrderServiceSchema.safeParse({
        serviceId: 1,
        mechanicId: null,
        quantity: 0,
        unitPrice: 50,
        notes: "",
      }).success,
    ).toBe(false);
  });
});

describe("workOrderPartSchema", () => {
  it("accepts valid part line", () => {
    expect(
      workOrderPartSchema.safeParse({ partId: 1, quantity: 2, unitPrice: 25 })
        .success,
    ).toBe(true);
  });

  it("rejects partId 0", () => {
    expect(
      workOrderPartSchema.safeParse({ partId: 0, quantity: 2, unitPrice: 25 })
        .success,
    ).toBe(false);
  });
});

// ── Invoice & Payment ───────────────────────────────────
describe("invoiceSchema", () => {
  const valid = {
    workOrderId: 1,
    customerId: 1,
    taxAmount: 10,
    discountAmount: 0,
    dueDate: "2024-07-01",
    notes: "",
  };

  it("accepts valid data", () => {
    expect(invoiceSchema.safeParse(valid).success).toBe(true);
  });

  it("requires workOrderId > 0", () => {
    expect(invoiceSchema.safeParse({ ...valid, workOrderId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects negative taxAmount", () => {
    expect(invoiceSchema.safeParse({ ...valid, taxAmount: -1 }).success).toBe(
      false,
    );
  });
});

describe("paymentSchema", () => {
  const valid = {
    invoiceId: 1,
    amount: 100,
    paymentMethod: "CASH",
    paymentDate: "2024-06-15",
    reference: "",
    notes: "",
  };

  it("accepts valid data", () => {
    expect(paymentSchema.safeParse(valid).success).toBe(true);
  });

  it("requires positive amount", () => {
    expect(paymentSchema.safeParse({ ...valid, amount: 0 }).success).toBe(
      false,
    );
  });

  it("requires paymentMethod", () => {
    expect(
      paymentSchema.safeParse({ ...valid, paymentMethod: "" }).success,
    ).toBe(false);
  });

  it("requires paymentDate", () => {
    expect(paymentSchema.safeParse({ ...valid, paymentDate: "" }).success).toBe(
      false,
    );
  });
});

// ── Purchase Order ──────────────────────────────────────
describe("purchaseOrderSchema", () => {
  it("accepts valid data", () => {
    expect(
      purchaseOrderSchema.safeParse({
        supplierId: 1,
        expectedDeliveryDate: "2024-07-01",
        notes: "",
      }).success,
    ).toBe(true);
  });

  it("requires supplierId > 0", () => {
    expect(
      purchaseOrderSchema.safeParse({
        supplierId: 0,
        expectedDeliveryDate: "",
        notes: "",
      }).success,
    ).toBe(false);
  });
});

describe("purchaseOrderItemSchema", () => {
  it("accepts valid item", () => {
    expect(
      purchaseOrderItemSchema.safeParse({
        partId: 1,
        quantity: 10,
        unitCost: 5.5,
      }).success,
    ).toBe(true);
  });

  it("requires quantity ≥ 1", () => {
    expect(
      purchaseOrderItemSchema.safeParse({ partId: 1, quantity: 0, unitCost: 5 })
        .success,
    ).toBe(false);
  });

  it("requires unitCost ≥ 0", () => {
    expect(
      purchaseOrderItemSchema.safeParse({
        partId: 1,
        quantity: 1,
        unitCost: -1,
      }).success,
    ).toBe(false);
  });
});

// ── Inventory (Part + Stock Adjustment) ─────────────────
describe("partSchema", () => {
  const valid = {
    name: "Oil Filter",
    partNumber: "OF-100",
    description: "",
    category: "Filters",
    supplierId: null,
    unitCost: 5.0,
    sellingPrice: 10.0,
    quantityInStock: 50,
    reorderLevel: 10,
    location: "A1",
    isActive: true,
  };

  it("accepts valid data", () => {
    expect(partSchema.safeParse(valid).success).toBe(true);
  });

  it("requires name", () => {
    expect(partSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects negative unitCost", () => {
    expect(partSchema.safeParse({ ...valid, unitCost: -1 }).success).toBe(
      false,
    );
  });

  it("rejects negative quantityInStock", () => {
    expect(
      partSchema.safeParse({ ...valid, quantityInStock: -5 }).success,
    ).toBe(false);
  });
});

describe("stockAdjustmentSchema", () => {
  it("accepts ADD type", () => {
    expect(
      stockAdjustmentSchema.safeParse({
        adjustmentType: "ADD",
        quantity: 10,
        reason: "Restock",
      }).success,
    ).toBe(true);
  });

  it("accepts SET type", () => {
    expect(
      stockAdjustmentSchema.safeParse({
        adjustmentType: "SET",
        quantity: 0,
        reason: "Inventory count",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid adjustmentType", () => {
    expect(
      stockAdjustmentSchema.safeParse({
        adjustmentType: "DESTROY",
        quantity: 1,
        reason: "test",
      }).success,
    ).toBe(false);
  });

  it("requires reason", () => {
    expect(
      stockAdjustmentSchema.safeParse({
        adjustmentType: "ADD",
        quantity: 1,
        reason: "",
      }).success,
    ).toBe(false);
  });
});
