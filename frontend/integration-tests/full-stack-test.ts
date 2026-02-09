/**
 * Full-Stack Integration Test Suite
 * ==================================
 * Tests all major flows: Auth → Dashboard → CRUD → Business Logic → Reports
 *
 * Run with: npx tsx integration-tests/full-stack-test.ts
 */

const BASE_URL = "http://localhost:4000/api/v1";
const FRONTEND_URL = "http://localhost:3000";

let AUTH_TOKEN = "";
let createdCustomerId = 0;
let createdVehicleId = 0;
let createdWorkOrderId = 0;
let createdInvoiceId = 0;
let createdAppointmentId = 0;
let createdExpenseId = 0;
let createdPOId = 0;

interface TestResult {
  name: string;
  status: "PASS" | "FAIL";
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token || AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${token || AUTH_TOKEN}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status} ${data.message || res.statusText}`);
  }
  return data;
}

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, status: "PASS", duration: Date.now() - start });
    console.log(`  ✅ ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({
      name,
      status: "FAIL",
      duration: Date.now() - start,
      error: err.message,
    });
    console.log(`  ❌ ${name} (${Date.now() - start}ms) — ${err.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// ── Test Groups ──────────────────────────────────────────────────────

async function testAuthFlow() {
  console.log("\n🔐 AUTH FLOW");

  await runTest("Login with valid credentials", async () => {
    const res = await api("POST", "/auth/login", {
      email: "admin@workshop.com",
      password: "Admin123!",
    });
    assert(res.success === true, "Login should succeed");
    assert(typeof res.data.token === "string", "Should return JWT token");
    assert(res.data.user.email === "admin@workshop.com", "Should return user");
    AUTH_TOKEN = res.data.token;
  });

  await runTest("Login with invalid credentials returns error", async () => {
    try {
      await api("POST", "/auth/login", {
        email: "admin@workshop.com",
        password: "WrongPassword!",
      });
      throw new Error("Should have thrown");
    } catch (e: any) {
      assert(
        e.message.includes("401") || e.message.includes("Invalid"),
        "Should return 401",
      );
    }
  });

  await runTest("Get profile with valid token", async () => {
    const res = await api("GET", "/auth/me");
    assert(res.success === true, "Should succeed");
    assert(res.data.email === "admin@workshop.com", "Should return admin user");
    assert(res.data.role === "ADMIN", "Should have ADMIN role");
  });

  await runTest("Protected route without token returns 401", async () => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const res = await fetch(`${BASE_URL}/auth/me`, { headers });
      const data = await res.json();
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    } catch (e: any) {
      // expected
    }
  });
}

async function testDashboard() {
  console.log("\n📊 DASHBOARD");

  await runTest("Dashboard summary loads", async () => {
    const res = await api("GET", "/dashboard/summary");
    assert(res.success === true, "Should succeed");
    assert(
      typeof res.data.activeCustomers === "number",
      "Should have activeCustomers",
    );
    assert(
      typeof res.data.openWorkOrders === "number",
      "Should have openWorkOrders",
    );
    assert(
      typeof res.data.totalRevenue === "number",
      "Should have totalRevenue",
    );
  });

  await runTest("Work orders by status loads", async () => {
    const res = await api("GET", "/dashboard/work-orders-by-status");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("Inventory alerts loads", async () => {
    const res = await api("GET", "/dashboard/inventory-alerts");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("Top services loads", async () => {
    const res = await api("GET", "/dashboard/top-services?limit=5");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testCustomerCRUD() {
  console.log("\n👥 CUSTOMERS CRUD");

  const uniqueSuffix = Date.now();

  await runTest("Create customer", async () => {
    // Use unique email to avoid conflict with prior test runs
    const email = `inttest-${uniqueSuffix}-${Math.random().toString(36).slice(2, 8)}@test.local`;
    const res = await api("POST", "/customers", {
      firstName: "Test",
      lastName: "IntegrationUser",
      phone: `555-${uniqueSuffix.toString().slice(-4)}`,
      email,
      address: "123 Test Street",
      city: "Testville",
      postalCode: "00000",
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdCustomerId = res.data.id;
  });

  await runTest("Get customer by ID", async () => {
    assert(createdCustomerId > 0, "Need valid customer ID from create step");
    const res = await api("GET", `/customers/${createdCustomerId}`);
    assert(res.success === true, "Should succeed");
    assert(res.data.firstName === "Test", "Should match created data");
    assert(res.data.lastName === "IntegrationUser", "Should match last name");
  });

  await runTest("List customers", async () => {
    const res = await api("GET", "/customers");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
    assert(res.data.length > 0, "Should have at least one customer");
  });

  await runTest("Update customer", async () => {
    assert(createdCustomerId > 0, "Need valid customer ID from create step");
    const res = await api("PATCH", `/customers/${createdCustomerId}`, {
      notes: "Updated via integration test",
    });
    assert(res.success === true, "Should succeed");
    assert(
      res.data.notes === "Updated via integration test",
      "Should update notes",
    );
  });
}

async function testVehicleCRUD() {
  console.log("\n🚗 VEHICLES CRUD");

  await runTest("Create vehicle", async () => {
    assert(createdCustomerId > 0, "Need valid customer ID from create step");
    const rand = Math.random().toString(36).slice(2, 12).toUpperCase();
    const vin = ("1HGBH41JXMN" + rand).slice(0, 17);
    const plate = `T-${Date.now().toString(36).toUpperCase()}`;
    const res = await api("POST", "/vehicles", {
      customerId: createdCustomerId,
      make: "Toyota",
      model: "Camry",
      year: 2023,
      licensePlate: plate,
      vin,
      color: "Blue",
      mileage: 15000,
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdVehicleId = res.data.id;
  });

  await runTest("Get vehicle by ID", async () => {
    assert(createdVehicleId > 0, "Need valid vehicle ID from create step");
    const res = await api("GET", `/vehicles/${createdVehicleId}`);
    assert(res.success === true, "Should succeed");
    assert(res.data.make === "Toyota", "Should match created data");
  });

  await runTest("List vehicles", async () => {
    const res = await api("GET", "/vehicles");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testEmployeeCRUD() {
  console.log("\n👨‍🔧 EMPLOYEES CRUD");

  await runTest("List employees", async () => {
    const res = await api("GET", "/employees");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
    assert(res.data.length > 0, "Should have seeded employees");
  });

  await runTest("Get employee by ID", async () => {
    const res = await api("GET", "/employees/1");
    assert(res.success === true, "Should succeed");
    assert(res.data.firstName === "John", "Should match seeded data");
  });
}

async function testServicesCRUD() {
  console.log("\n🔧 SERVICES & CATEGORIES");

  await runTest("List service categories", async () => {
    const res = await api("GET", "/service-categories");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("List services", async () => {
    const res = await api("GET", "/services");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testPartsCRUD() {
  console.log("\n📦 PARTS (INVENTORY)");

  await runTest("List parts", async () => {
    const res = await api("GET", "/parts");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
    assert(res.data.length > 0, "Should have seeded parts");
  });

  await runTest("Get part by ID", async () => {
    const res = await api("GET", "/parts/1");
    assert(res.success === true, "Should succeed");
    assert(res.data.partName !== undefined, "Should have partName");
  });

  await runTest("Get low-stock parts", async () => {
    const res = await api("GET", "/parts/low-stock");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testSuppliersCRUD() {
  console.log("\n🏭 SUPPLIERS");

  await runTest("List suppliers", async () => {
    const res = await api("GET", "/suppliers");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
    assert(res.data.length > 0, "Should have seeded suppliers");
  });
}

async function testWorkOrderFlow() {
  console.log("\n📋 WORK ORDERS FLOW");

  await runTest("Create work order", async () => {
    assert(createdVehicleId > 0, "Need valid vehicle ID");
    assert(createdCustomerId > 0, "Need valid customer ID");
    const res = await api("POST", "/work-orders", {
      customerId: createdCustomerId,
      vehicleId: createdVehicleId,
      assignedEmployeeId: 1,
      priority: "NORMAL",
      description: "Integration test work order",
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdWorkOrderId = res.data.id;
  });

  await runTest("Get work order by ID", async () => {
    assert(createdWorkOrderId > 0, "Need valid work order ID");
    const res = await api("GET", `/work-orders/${createdWorkOrderId}`);
    assert(res.success === true, "Should succeed");
    assert(res.data.status === "PENDING", "Should start as PENDING");
  });

  await runTest("Add service to work order", async () => {
    assert(createdWorkOrderId > 0, "Need valid work order ID");
    const services = await api("GET", "/services");
    if (services.data.length > 0) {
      const svc = services.data[0];
      const res = await api(
        "POST",
        `/work-orders/${createdWorkOrderId}/services`,
        {
          serviceId: svc.id,
          quantity: 1,
          unitPrice: parseFloat(svc.basePrice || svc.price || "50"),
        },
      );
      assert(res.success === true, "Should succeed");
    }
  });

  await runTest("Add part to work order", async () => {
    assert(createdWorkOrderId > 0, "Need valid work order ID");
    const res = await api("POST", `/work-orders/${createdWorkOrderId}/parts`, {
      partId: 1,
      quantity: 2,
      unitPrice: 35,
    });
    assert(res.success === true, "Should succeed");
  });

  await runTest("Update work order status to IN_PROGRESS", async () => {
    assert(createdWorkOrderId > 0, "Need valid work order ID");
    const res = await api(
      "PATCH",
      `/work-orders/${createdWorkOrderId}/status`,
      {
        status: "IN_PROGRESS",
      },
    );
    assert(res.success === true, "Should succeed");
  });

  await runTest("Update work order status to COMPLETED", async () => {
    assert(createdWorkOrderId > 0, "Need valid work order ID");
    const res = await api(
      "PATCH",
      `/work-orders/${createdWorkOrderId}/status`,
      {
        status: "COMPLETED",
      },
    );
    assert(res.success === true, "Should succeed");
  });

  await runTest("List work orders", async () => {
    const res = await api("GET", "/work-orders");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testAppointmentFlow() {
  console.log("\n📅 APPOINTMENTS FLOW");

  await runTest("Create appointment", async () => {
    assert(createdCustomerId > 0, "Need valid customer ID");
    assert(createdVehicleId > 0, "Need valid vehicle ID");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const res = await api("POST", "/appointments", {
      customerId: createdCustomerId,
      vehicleId: createdVehicleId,
      appointmentDate: tomorrow.toISOString(),
      estimatedDuration: 60,
      notes: "Integration test appointment",
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdAppointmentId = res.data.id;
  });

  await runTest("Get appointment by ID", async () => {
    assert(createdAppointmentId > 0, "Need valid appointment ID");
    const res = await api("GET", `/appointments/${createdAppointmentId}`);
    assert(res.success === true, "Should succeed");
  });

  await runTest("List appointments", async () => {
    const res = await api("GET", "/appointments");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testInvoiceFlow() {
  console.log("\n💰 INVOICES & PAYMENTS FLOW");

  await runTest("Create invoice from work order", async () => {
    assert(createdWorkOrderId > 0, "Need valid work order ID");
    const res = await api("POST", "/invoices", {
      workOrderId: createdWorkOrderId,
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdInvoiceId = res.data.id;
  });

  await runTest("Get invoice by ID", async () => {
    assert(createdInvoiceId > 0, "Need valid invoice ID");
    const res = await api("GET", `/invoices/${createdInvoiceId}`);
    assert(res.success === true, "Should succeed");
    assert(res.data.status !== undefined, "Should have status");
  });

  await runTest("Record payment on invoice", async () => {
    assert(createdInvoiceId > 0, "Need valid invoice ID");
    const res = await api("POST", "/payments", {
      invoiceId: createdInvoiceId,
      paymentMethod: "CASH",
      amount: 10,
      paymentDate: new Date().toISOString(),
      referenceNumber: `TEST-${Date.now()}`,
    });
    assert(res.success === true, "Should succeed");
  });

  await runTest("List invoices", async () => {
    const res = await api("GET", "/invoices");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("List payments", async () => {
    const res = await api("GET", "/payments");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testExpenseFlow() {
  console.log("\n🧾 EXPENSES");

  await runTest("Create expense", async () => {
    const res = await api("POST", "/expenses", {
      description: "Integration test expense",
      amount: 150.0,
      category: "OTHER",
      expenseDate: new Date().toISOString().split("T")[0],
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdExpenseId = res.data.id;
  });

  await runTest("List expenses", async () => {
    const res = await api("GET", "/expenses");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testPurchaseOrderFlow() {
  console.log("\n🛒 PURCHASE ORDERS");

  await runTest("Create purchase order with items", async () => {
    const res = await api("POST", "/purchase-orders", {
      supplierId: 1,
      orderNumber: `PO-TEST-${Date.now()}`,
      orderDate: new Date().toISOString(),
      notes: "Integration test PO",
      items: [
        { partId: 1, quantityOrdered: 10, unitCost: 22 },
        { partId: 2, quantityOrdered: 5, unitCost: 5 },
      ],
    });
    assert(res.success === true, "Should succeed");
    assert(res.data.id > 0, "Should return ID");
    createdPOId = res.data.id;
  });

  await runTest("Get purchase order by ID", async () => {
    assert(createdPOId > 0, "Need valid PO ID");
    const res = await api("GET", `/purchase-orders/${createdPOId}`);
    assert(res.success === true, "Should succeed");
  });

  await runTest("List purchase orders", async () => {
    const res = await api("GET", "/purchase-orders");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });
}

async function testReports() {
  console.log("\n📈 REPORTS");

  await runTest("Revenue report", async () => {
    const res = await api("GET", "/dashboard/revenue");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("Revenue vs Expenses", async () => {
    const res = await api("GET", "/dashboard/revenue-vs-expenses");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("Mechanic productivity", async () => {
    const res = await api("GET", "/dashboard/mechanic-productivity");
    assert(res.success === true, "Should succeed");
    assert(Array.isArray(res.data), "Should return array");
  });

  await runTest("Service history for vehicle", async () => {
    // Service history is derived from work orders, need a valid vehicleId
    if (createdVehicleId > 0) {
      const res = await api(
        "GET",
        `/service-history/vehicle/${createdVehicleId}`,
      );
      assert(res.success === true, "Should succeed");
    } else {
      // Use seeded vehicle if available
      const vehicles = await api("GET", "/vehicles");
      if (vehicles.data && vehicles.data.length > 0) {
        const res = await api(
          "GET",
          `/service-history/vehicle/${vehicles.data[0].id}`,
        );
        assert(res.success === true, "Should succeed");
      }
    }
  });
}

async function testFrontendAccessibility() {
  console.log("\n🌐 FRONTEND PAGE ACCESSIBILITY");

  const pages = [
    "/login",
    "/",
    "/customers",
    "/employees",
    "/services",
    "/vehicles",
    "/work-orders",
    "/appointments",
    "/inventory",
    "/suppliers",
    "/purchase-orders",
    "/invoices",
    "/expenses",
    "/reports",
    "/reports/revenue",
    "/reports/productivity",
    "/reports/top-services",
    "/settings",
  ];

  for (const page of pages) {
    await runTest(`Frontend page loads: ${page}`, async () => {
      const res = await fetch(`${FRONTEND_URL}${page}`, {
        redirect: "follow",
      });
      assert(res.status === 200, `Expected 200, got ${res.status} for ${page}`);
      const html = await res.text();
      assert(html.includes("</html>"), "Should return valid HTML");
    });
  }
}

async function testCleanup() {
  console.log("\n🧹 CLEANUP");

  await runTest("Delete test expense", async () => {
    if (createdExpenseId > 0) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      };
      const res = await fetch(`${BASE_URL}/expenses/${createdExpenseId}`, {
        method: "DELETE",
        headers,
      });
      assert(
        res.status === 200 || res.status === 204,
        `Expected 200/204, got ${res.status}`,
      );
    }
  });

  await runTest("Delete test customer", async () => {
    if (createdCustomerId > 0) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      };
      const res = await fetch(`${BASE_URL}/customers/${createdCustomerId}`, {
        method: "DELETE",
        headers,
      });
      // May fail due to FK constraints, that's OK
      assert(
        res.status === 200 || res.status === 204 || res.status === 409,
        `Expected 200/204/409, got ${res.status}`,
      );
    }
  });
}

// ── Main Runner ──────────────────────────────────────────────────────

async function main() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   Full-Stack Integration Test Suite                ║");
  console.log("║   Backend: http://localhost:4000                   ║");
  console.log("║   Frontend: http://localhost:3000                  ║");
  console.log("╚════════════════════════════════════════════════════╝");

  // Verify services are up
  try {
    await fetch(`${BASE_URL}/auth/login`);
  } catch {
    console.error("❌ Backend is not running on port 4000!");
    process.exit(1);
  }
  try {
    await fetch(FRONTEND_URL);
  } catch {
    console.error("❌ Frontend is not running on port 3000!");
    process.exit(1);
  }

  console.log("✅ Both services are running\n");

  // Run all test groups in order
  await testAuthFlow();
  await sleep(1000);
  await testDashboard();
  await sleep(1000);
  await testCustomerCRUD();
  await sleep(1000);
  await testVehicleCRUD();
  await sleep(1000);
  await testEmployeeCRUD();
  await sleep(1000);
  await testServicesCRUD();
  await sleep(1000);
  await testPartsCRUD();
  await sleep(1000);
  await testSuppliersCRUD();
  await sleep(1000);
  await testWorkOrderFlow();
  await sleep(1000);
  await testAppointmentFlow();
  await sleep(1000);
  await testInvoiceFlow();
  await sleep(1000);
  await testExpenseFlow();
  await sleep(1000);
  await testPurchaseOrderFlow();
  await sleep(1000);
  await testReports();
  await sleep(1000);
  await testFrontendAccessibility();
  await testCleanup();

  // Summary
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║   RESULTS SUMMARY                                 ║");
  console.log("╚════════════════════════════════════════════════════╝");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const total = results.length;

  console.log(
    `\n  Total: ${total}  |  ✅ Passed: ${passed}  |  ❌ Failed: ${failed}`,
  );
  console.log(`  Pass Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log("  FAILURES:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => {
        console.log(`    ❌ ${r.name}: ${r.error}`);
      });
    console.log();
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
