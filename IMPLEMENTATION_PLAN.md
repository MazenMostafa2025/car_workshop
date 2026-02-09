# Car Workshop Management System — Backend Implementation Plan

> **Architecture**: Modular Clean Architecture (per-module routes/controllers/services)  
> **Stack**: Node.js · Express · TypeScript · PostgreSQL · Prisma · Zod  
> **Principles**: CLEAN Code · SOLID · Singleton DB · Dependency Injection

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Foundation Layer (Phase 0)](#3-foundation-layer-phase-0)
4. [Module Breakdown & Implementation Phases](#4-module-breakdown--implementation-phases)
5. [Module Internal Anatomy](#5-module-internal-anatomy)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [Database Strategy](#7-database-strategy)
8. [API Design Conventions](#8-api-design-conventions)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Testing Strategy](#10-testing-strategy)
11. [Phase-by-Phase Execution Roadmap](#11-phase-by-phase-execution-roadmap)

---

## 1. Architecture Overview

### 1.1 Why Modular (Feature-Based) Architecture?

Instead of grouping by technical concern (`/controllers`, `/routes`, `/services`), we group by **business domain**. Each module is a self-contained vertical slice:

```
Traditional (❌ We are NOT doing this)     Modular (✅ We ARE doing this)
─────────────────────────────────────     ──────────────────────────────
src/                                      src/
├── controllers/                          ├── modules/
│   ├── customerController.ts             │   ├── customer/
│   ├── vehicleController.ts              │   │   ├── customer.routes.ts
│   └── ...                               │   │   ├── customer.controller.ts
├── routes/                               │   │   ├── customer.service.ts
│   ├── customerRoutes.ts                 │   │   ├── customer.validation.ts
│   └── ...                               │   │   ├── customer.types.ts
├── services/                             │   │   └── index.ts
│   ├── customerService.ts                │   ├── vehicle/
│   └── ...                               │   │   ├── vehicle.routes.ts
└── middlewares/                           │   │   ├── ...
                                          │   └── ...
```

**Benefits**:

- High cohesion — everything about a feature lives together
- Easy to navigate — find a bug in invoices? Go to `modules/invoice/`
- Scalable — adding a module doesn't touch existing ones (Open/Closed Principle)
- Team-friendly — developers can own entire modules without merge conflicts

### 1.2 SOLID Principles Mapping

| Principle                     | How We Apply It                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| **S** — Single Responsibility | Each layer (controller, service, validation) has one job                                 |
| **O** — Open/Closed           | New modules are added without modifying existing ones; middleware pipeline is extensible |
| **L** — Liskov Substitution   | Service interfaces allow swapping implementations (e.g., test doubles)                   |
| **I** — Interface Segregation | Small, focused types per module — no god interfaces                                      |
| **D** — Dependency Inversion  | Controllers depend on service abstractions; DB access is injected via singleton          |

### 1.3 Request Flow

```
Client Request
     │
     ▼
[ Express App ]
     │
     ▼
[ Global Middlewares ]  →  helmet, cors, morgan, rateLimiter, jsonParser
     │
     ▼
[ Module Router ]       →  /api/v1/customers/*
     │
     ▼
[ Route Middlewares ]   →  authenticate, authorize('admin','manager')
     │
     ▼
[ Validation ]          →  Zod schema validates req.body / req.params / req.query
     │
     ▼
[ Controller ]          →  Orchestrates: calls service, shapes response
     │
     ▼
[ Service ]             →  Business logic, DB queries via Prisma singleton
     │
     ▼
[ Prisma Singleton ]    →  Single PrismaClient instance for connection pooling
     │
     ▼
[ PostgreSQL ]
```

---

## 2. Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma              # Prisma schema (source of truth for DB)
│   ├── migrations/                # Auto-generated migration files
│   └── seed.ts                    # Database seeding script
│
├── src/
│   ├── app.ts                     # Express app setup (middlewares, route mounting)
│   ├── server.ts                  # Entry point — starts HTTP server
│   │
│   ├── config/
│   │   ├── index.ts               # Centralized config from env vars (validated)
│   │   ├── env.validation.ts      # Zod schema for env var validation
│   │   └── constants.ts           # App-wide constants (statuses, roles, etc.)
│   │
│   ├── common/
│   │   ├── database/
│   │   │   └── prisma.ts          # Singleton PrismaClient
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts    # JWT verification middleware
│   │   │   ├── authorize.ts       # Role-based access control middleware
│   │   │   ├── validate.ts        # Generic Zod validation middleware factory
│   │   │   ├── errorHandler.ts    # Global error handling middleware
│   │   │   ├── notFound.ts        # 404 handler
│   │   │   ├── rateLimiter.ts     # Rate limiting middleware
│   │   │   └── requestLogger.ts   # Morgan / custom request logging
│   │   ├── errors/
│   │   │   ├── AppError.ts        # Base custom error class
│   │   │   ├── NotFoundError.ts   # 404 errors
│   │   │   ├── ValidationError.ts # 400 validation errors
│   │   │   ├── UnauthorizedError.ts
│   │   │   ├── ForbiddenError.ts
│   │   │   └── ConflictError.ts   # 409 duplicate/conflict errors
│   │   ├── types/
│   │   │   ├── express.d.ts       # Express type augmentations (req.user)
│   │   │   ├── pagination.ts      # Shared pagination types
│   │   │   └── api-response.ts    # Standard API response envelope type
│   │   └── utils/
│   │       ├── apiResponse.ts     # Helper to build consistent JSON responses
│   │       ├── asyncHandler.ts    # Wraps async route handlers (try/catch)
│   │       ├── pagination.ts      # Pagination helper (offset, limit, meta)
│   │       ├── invoice-number.ts  # Sequential invoice number generator
│   │       └── date.ts            # Date formatting helpers
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.routes.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.validation.ts
│       │   ├── auth.types.ts
│       │   └── index.ts
│       │
│       ├── customer/
│       │   ├── customer.routes.ts
│       │   ├── customer.controller.ts
│       │   ├── customer.service.ts
│       │   ├── customer.validation.ts
│       │   ├── customer.types.ts
│       │   └── index.ts
│       │
│       ├── vehicle/
│       │   ├── vehicle.routes.ts
│       │   ├── vehicle.controller.ts
│       │   ├── vehicle.service.ts
│       │   ├── vehicle.validation.ts
│       │   ├── vehicle.types.ts
│       │   └── index.ts
│       │
│       ├── employee/
│       │   ├── employee.routes.ts
│       │   ├── employee.controller.ts
│       │   ├── employee.service.ts
│       │   ├── employee.validation.ts
│       │   ├── employee.types.ts
│       │   └── index.ts
│       │
│       ├── service-catalog/
│       │   ├── service-catalog.routes.ts
│       │   ├── service-catalog.controller.ts
│       │   ├── service-catalog.service.ts
│       │   ├── service-catalog.validation.ts
│       │   ├── service-catalog.types.ts
│       │   └── index.ts
│       │
│       ├── work-order/
│       │   ├── work-order.routes.ts
│       │   ├── work-order.controller.ts
│       │   ├── work-order.service.ts
│       │   ├── work-order.validation.ts
│       │   ├── work-order.types.ts
│       │   └── index.ts
│       │
│       ├── inventory/
│       │   ├── inventory.routes.ts
│       │   ├── inventory.controller.ts
│       │   ├── inventory.service.ts
│       │   ├── inventory.validation.ts
│       │   ├── inventory.types.ts
│       │   └── index.ts
│       │
│       ├── supplier/
│       │   ├── supplier.routes.ts
│       │   ├── supplier.controller.ts
│       │   ├── supplier.service.ts
│       │   ├── supplier.validation.ts
│       │   ├── supplier.types.ts
│       │   └── index.ts
│       │
│       ├── purchase-order/
│       │   ├── purchase-order.routes.ts
│       │   ├── purchase-order.controller.ts
│       │   ├── purchase-order.service.ts
│       │   ├── purchase-order.validation.ts
│       │   ├── purchase-order.types.ts
│       │   └── index.ts
│       │
│       ├── invoice/
│       │   ├── invoice.routes.ts
│       │   ├── invoice.controller.ts
│       │   ├── invoice.service.ts
│       │   ├── invoice.validation.ts
│       │   ├── invoice.types.ts
│       │   └── index.ts
│       │
│       ├── payment/
│       │   ├── payment.routes.ts
│       │   ├── payment.controller.ts
│       │   ├── payment.service.ts
│       │   ├── payment.validation.ts
│       │   ├── payment.types.ts
│       │   └── index.ts
│       │
│       ├── appointment/
│       │   ├── appointment.routes.ts
│       │   ├── appointment.controller.ts
│       │   ├── appointment.service.ts
│       │   ├── appointment.validation.ts
│       │   ├── appointment.types.ts
│       │   └── index.ts
│       │
│       ├── service-history/
│       │   ├── service-history.routes.ts
│       │   ├── service-history.controller.ts
│       │   ├── service-history.service.ts
│       │   ├── service-history.validation.ts
│       │   ├── service-history.types.ts
│       │   └── index.ts
│       │
│       ├── expense/
│       │   ├── expense.routes.ts
│       │   ├── expense.controller.ts
│       │   ├── expense.service.ts
│       │   ├── expense.validation.ts
│       │   ├── expense.types.ts
│       │   └── index.ts
│       │
│       └── dashboard/
│           ├── dashboard.routes.ts
│           ├── dashboard.controller.ts
│           ├── dashboard.service.ts
│           ├── dashboard.types.ts
│           └── index.ts
│
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
├── Dockerfile
└── README.md
```

---

## 3. Foundation Layer (Phase 0)

> Build the skeleton before any business module. Everything below is a prerequisite.

### 3.1 Project Initialization

| Step | Description                                                                                  |
| ---- | -------------------------------------------------------------------------------------------- |
| 1    | Initialize `backend/` with `npm init`, install dependencies                                  |
| 2    | Configure `tsconfig.json` (strict mode, path aliases `@common/*`, `@modules/*`, `@config/*`) |
| 3    | Configure ESLint + Prettier for consistent code style                                        |
| 4    | Set up `Dockerfile` for containerized development                                            |

**Dependencies** (cleaned from AI packages):

```
# Runtime
express, cors, dotenv, helmet, compression, morgan,
bcryptjs, jsonwebtoken, zod, date-fns, uuid, multer, sharp

# Prisma
@prisma/client, prisma

# Dev
typescript, ts-node, ts-node-dev,
@types/express, @types/node, @types/cors, @types/bcryptjs,
@types/jsonwebtoken, @types/morgan, @types/compression, @types/multer,
@typescript-eslint/eslint-plugin, @typescript-eslint/parser, eslint, prettier
```

> **Note**: `express-validator` is removed — we use **Zod** for all validation.  
> **Note**: `openai`, `anthropic`, `twilio`, `@sendgrid/mail` are **excluded** from this plan.

### 3.2 Environment Config with Zod Validation

```
src/config/env.validation.ts  →  Zod schema that validates ALL env vars at startup
src/config/index.ts           →  Parses .env, validates, exports typed config object
```

If any required env var is missing or invalid, the app **refuses to start** with a clear error message. This is a fail-fast pattern.

### 3.3 Singleton Prisma Client

```
src/common/database/prisma.ts
```

- Exports a single `PrismaClient` instance
- Handles graceful connection shutdown
- Logs queries in development mode
- All modules import from this one file — **never** instantiate PrismaClient elsewhere

### 3.4 Global Middlewares

| Middleware    | File               | Purpose                             |
| ------------- | ------------------ | ----------------------------------- |
| Helmet        | `app.ts` (inline)  | Security headers                    |
| CORS          | `app.ts` (inline)  | Cross-origin config from env        |
| Compression   | `app.ts` (inline)  | Gzip responses                      |
| Morgan        | `requestLogger.ts` | HTTP request logging                |
| JSON Parser   | `app.ts` (inline)  | `express.json()` with size limit    |
| Rate Limiter  | `rateLimiter.ts`   | Configurable rate limiting          |
| Not Found     | `notFound.ts`      | Catch-all 404 for unmatched routes  |
| Error Handler | `errorHandler.ts`  | Global error → JSON response mapper |

### 3.5 Shared Utilities

| Utility                    | Purpose                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `asyncHandler.ts`          | Wraps async controllers so thrown errors reach the error handler              |
| `apiResponse.ts`           | Standardizes `{ success, message, data, meta }` response shape                |
| `pagination.ts`            | Parses `page` & `limit` query params, returns offset + pagination meta        |
| `AppError.ts` + subclasses | Typed error classes with HTTP status codes                                    |
| `validate.ts`              | Middleware factory: takes a Zod schema, validates `body` / `params` / `query` |

### 3.6 Prisma Schema Setup

Translate the existing SQL schema (`car_workshop_schema.sql`) into `prisma/schema.prisma` with:

- All 15 tables as Prisma models
- Proper relations (`@relation`)
- Indexes (`@@index`)
- Enums for status fields (`WorkOrderStatus`, `InvoiceStatus`, `AppointmentStatus`, etc.)
- `@default`, `@updatedAt` decorators
- UUID or auto-increment IDs (matching the SQL's `AUTO_INCREMENT`)

### 3.7 Authentication Module (Pre-requisite Module)

Before any business module, implement `modules/auth/` because almost every route requires authentication:

| Endpoint                       | Method | Description                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `/api/v1/auth/register`        | POST   | Register new user (admin-only in production) |
| `/api/v1/auth/login`           | POST   | Login → returns JWT access token             |
| `/api/v1/auth/me`              | GET    | Get current user profile                     |
| `/api/v1/auth/change-password` | PATCH  | Change own password                          |

**Implementation details**:

- Passwords hashed with `bcryptjs` (salt rounds: 12)
- JWT tokens with configurable expiration
- `authenticate` middleware verifies JWT and attaches `req.user`
- `authorize(...roles)` middleware checks role-based access
- Requires adding a `users` table to the Prisma schema (or repurposing `employees` with a `password_hash` and `role` field)

---

## 4. Module Breakdown & Implementation Phases

### Module Dependency Graph

```
Phase 0: Foundation + Auth
              │
Phase 1:  ┌───┼───────────────┐
          │   │               │
      Customer Employee  Service Catalog
          │                   │
Phase 2:  │   ┌───────────────┤
          │   │               │
        Vehicle          Supplier
          │               │
Phase 3:  │           Inventory (Parts)
          │               │
          ├───────┬───────┤
          │       │       │
       Work Order ┘       │
          │               │
Phase 4:  │         Purchase Order
          │
          ├────────────┐
          │            │
       Invoice    Appointment
          │
Phase 5:  │
       Payment
          │
       Service History
          │
       Expense
          │
       Dashboard (Reports)
```

---

### Phase 1 — Core Entities (No Dependencies on Other Modules)

#### Module: `customer`

| Endpoint                            | Method | Description                                                |
| ----------------------------------- | ------ | ---------------------------------------------------------- |
| `/api/v1/customers`                 | GET    | List customers (paginated, searchable by name/phone/email) |
| `/api/v1/customers/:id`             | GET    | Get customer with vehicles & work order count              |
| `/api/v1/customers`                 | POST   | Create new customer                                        |
| `/api/v1/customers/:id`             | PATCH  | Update customer info                                       |
| `/api/v1/customers/:id`             | DELETE | Soft-delete customer                                       |
| `/api/v1/customers/:id/vehicles`    | GET    | List vehicles for a customer                               |
| `/api/v1/customers/:id/work-orders` | GET    | List work orders for a customer                            |

**Zod Schemas**:

- `createCustomerSchema` — first_name (required), last_name (required), phone (required), email (optional, valid email), address, city, postal_code
- `updateCustomerSchema` — all fields optional (partial of create)
- `customerQuerySchema` — page, limit, search, sortBy, sortOrder

**Business Rules**:

- Email must be unique (if provided)
- Phone is required and searchable
- Soft-delete sets an `is_active` flag (don't cascade-delete in production)

---

#### Module: `employee`

| Endpoint                            | Method | Description                                          |
| ----------------------------------- | ------ | ---------------------------------------------------- |
| `/api/v1/employees`                 | GET    | List employees (filter by role, is_active)           |
| `/api/v1/employees/:id`             | GET    | Get employee detail                                  |
| `/api/v1/employees`                 | POST   | Create employee                                      |
| `/api/v1/employees/:id`             | PATCH  | Update employee                                      |
| `/api/v1/employees/:id`             | DELETE | Deactivate employee                                  |
| `/api/v1/employees/:id/work-orders` | GET    | List work orders assigned to mechanic                |
| `/api/v1/employees/:id/schedule`    | GET    | Get mechanic's schedule (appointments + work orders) |

**Zod Schemas**:

- `createEmployeeSchema` — first_name, last_name, email, phone, role (enum: Mechanic/Manager/Receptionist), specialization, hire_date, hourly_rate
- `updateEmployeeSchema` — partial
- `employeeQuerySchema` — page, limit, role, is_active, search

**Business Rules**:

- Role is an enum validated by Zod
- Hourly rate must be positive
- Deactivated employees cannot be assigned new work orders

---

#### Module: `service-catalog`

Manages both **Service Categories** and **Services** in a single module.

| Endpoint                         | Method | Description                                    |
| -------------------------------- | ------ | ---------------------------------------------- |
| `/api/v1/service-categories`     | GET    | List all categories                            |
| `/api/v1/service-categories`     | POST   | Create category                                |
| `/api/v1/service-categories/:id` | PATCH  | Update category                                |
| `/api/v1/service-categories/:id` | DELETE | Delete category (only if no services attached) |
| `/api/v1/services`               | GET    | List services (filter by category, is_active)  |
| `/api/v1/services/:id`           | GET    | Get service detail                             |
| `/api/v1/services`               | POST   | Create service                                 |
| `/api/v1/services/:id`           | PATCH  | Update service                                 |
| `/api/v1/services/:id`           | DELETE | Deactivate service                             |

**Business Rules**:

- Base price must be positive
- Estimated duration in minutes, must be positive
- Cannot delete a category that has active services

---

### Phase 2 — Dependent Entities

#### Module: `vehicle`

| Endpoint                               | Method | Description                                               |
| -------------------------------------- | ------ | --------------------------------------------------------- |
| `/api/v1/vehicles`                     | GET    | List vehicles (paginated, search by plate/VIN/make/model) |
| `/api/v1/vehicles/:id`                 | GET    | Get vehicle with owner info & service history summary     |
| `/api/v1/vehicles`                     | POST   | Create vehicle (must reference existing customer_id)      |
| `/api/v1/vehicles/:id`                 | PATCH  | Update vehicle info (mileage, etc.)                       |
| `/api/v1/vehicles/:id`                 | DELETE | Soft-delete vehicle                                       |
| `/api/v1/vehicles/:id/service-history` | GET    | Full service history for this vehicle                     |

**Zod Schemas**:

- `createVehicleSchema` — customer_id (required, int), make, model, year (1900–current+1), vin (optional, 17 chars), license_plate (optional, unique), color, mileage (non-negative), engine_type, transmission_type
- `updateVehicleSchema` — partial (customer_id not changeable)

**Business Rules**:

- VIN must be exactly 17 characters if provided
- Year validated to reasonable range
- `customer_id` must reference an existing active customer

---

#### Module: `supplier`

| Endpoint                      | Method | Description                               |
| ----------------------------- | ------ | ----------------------------------------- |
| `/api/v1/suppliers`           | GET    | List suppliers (paginated, searchable)    |
| `/api/v1/suppliers/:id`       | GET    | Get supplier with parts count             |
| `/api/v1/suppliers`           | POST   | Create supplier                           |
| `/api/v1/suppliers/:id`       | PATCH  | Update supplier                           |
| `/api/v1/suppliers/:id`       | DELETE | Delete supplier (only if no parts linked) |
| `/api/v1/suppliers/:id/parts` | GET    | List parts from this supplier             |

---

### Phase 3 — Business Logic Entities

#### Module: `inventory`

Manages the **Parts** table.

| Endpoint                         | Method | Description                                                |
| -------------------------------- | ------ | ---------------------------------------------------------- |
| `/api/v1/parts`                  | GET    | List parts (filter: low-stock, category, supplier, search) |
| `/api/v1/parts/:id`              | GET    | Get part detail with supplier info                         |
| `/api/v1/parts`                  | POST   | Create part                                                |
| `/api/v1/parts/:id`              | PATCH  | Update part (price, stock, reorder level)                  |
| `/api/v1/parts/:id`              | DELETE | Deactivate part                                            |
| `/api/v1/parts/low-stock`        | GET    | Parts where quantity_in_stock ≤ reorder_level              |
| `/api/v1/parts/:id/adjust-stock` | PATCH  | Manual stock adjustment with reason                        |
| `/api/v1/parts/inventory-value`  | GET    | Total inventory cost & retail value                        |

**Business Rules**:

- `selling_price` must be ≥ `unit_cost` (warn if margin < 10%)
- Stock adjustments are logged
- Low-stock alerts when `quantity_in_stock ≤ reorder_level`

---

#### Module: `work-order`

The **central** business module — links customers, vehicles, employees, services, and parts.

| Endpoint                                      | Method | Description                                                                 |
| --------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `/api/v1/work-orders`                         | GET    | List work orders (filter: status, priority, date range, mechanic, customer) |
| `/api/v1/work-orders/:id`                     | GET    | Full work order detail (services, parts, costs, customer, vehicle)          |
| `/api/v1/work-orders`                         | POST   | Create work order                                                           |
| `/api/v1/work-orders/:id`                     | PATCH  | Update work order (status, diagnosis, etc.)                                 |
| `/api/v1/work-orders/:id/status`              | PATCH  | Transition status (with validation of allowed transitions)                  |
| `/api/v1/work-orders/:id/services`            | GET    | List services on this work order                                            |
| `/api/v1/work-orders/:id/services`            | POST   | Add service to work order                                                   |
| `/api/v1/work-orders/:id/services/:serviceId` | PATCH  | Update work order service (hours, price)                                    |
| `/api/v1/work-orders/:id/services/:serviceId` | DELETE | Remove service from work order                                              |
| `/api/v1/work-orders/:id/parts`               | GET    | List parts used on this work order                                          |
| `/api/v1/work-orders/:id/parts`               | POST   | Add part to work order (deducts inventory)                                  |
| `/api/v1/work-orders/:id/parts/:partId`       | PATCH  | Update quantity                                                             |
| `/api/v1/work-orders/:id/parts/:partId`       | DELETE | Remove part (restores inventory)                                            |

**Status Transitions** (enforced in service layer):

```
Pending  →  In Progress  →  Completed
   │                           │
   └──→  Cancelled             └──→  (Cannot revert)
```

**Business Rules**:

- Adding parts **decrements** `parts.quantity_in_stock` (use Prisma transactions)
- Removing parts **restores** stock
- Completing a work order recalculates `total_labor_cost`, `total_parts_cost`, `total_cost`
- Cannot add services/parts to a Completed or Cancelled work order
- All sub-resource mutations (services, parts) use **Prisma transactions** for data consistency

---

### Phase 4 — Financial & Scheduling Entities

#### Module: `purchase-order`

| Endpoint                                    | Method | Description                                       |
| ------------------------------------------- | ------ | ------------------------------------------------- |
| `/api/v1/purchase-orders`                   | GET    | List POs (filter: status, supplier, date range)   |
| `/api/v1/purchase-orders/:id`               | GET    | PO with line items                                |
| `/api/v1/purchase-orders`                   | POST   | Create PO with items                              |
| `/api/v1/purchase-orders/:id`               | PATCH  | Update PO                                         |
| `/api/v1/purchase-orders/:id/receive`       | PATCH  | Mark PO as received → auto-update parts inventory |
| `/api/v1/purchase-orders/:id/items`         | POST   | Add item to PO                                    |
| `/api/v1/purchase-orders/:id/items/:itemId` | PATCH  | Update line item                                  |
| `/api/v1/purchase-orders/:id/items/:itemId` | DELETE | Remove line item                                  |

**Business Rules**:

- Receiving a PO increments `parts.quantity_in_stock` for each item (transaction)
- PO `total_amount` is auto-calculated from line items
- Status flow: `Ordered → Received | Cancelled`

---

#### Module: `invoice`

| Endpoint                       | Method | Description                                          |
| ------------------------------ | ------ | ---------------------------------------------------- |
| `/api/v1/invoices`             | GET    | List invoices (filter: status, date range, customer) |
| `/api/v1/invoices/:id`         | GET    | Invoice detail with work order info & payments       |
| `/api/v1/invoices`             | POST   | Generate invoice from completed work order           |
| `/api/v1/invoices/:id`         | PATCH  | Update invoice (discount, tax, notes)                |
| `/api/v1/invoices/outstanding` | GET    | All unpaid/partially paid invoices                   |
| `/api/v1/invoices/:id/pdf`     | GET    | (Future) Generate PDF                                |

**Business Rules**:

- Invoice number is auto-generated sequentially (e.g., `INV-2026-00001`)
- Can only create invoice from a **Completed** work order
- One work order → one invoice (1:1)
- `subtotal` = work order's `total_cost`
- `total_amount` = `subtotal` + `tax_amount` - `discount_amount`
- `balance_due` = `total_amount` - `amount_paid`
- Status auto-updates: `amount_paid == 0` → Unpaid, `amount_paid < total` → Partially Paid, `amount_paid >= total` → Paid

---

#### Module: `appointment`

| Endpoint                               | Method | Description                                                  |
| -------------------------------------- | ------ | ------------------------------------------------------------ |
| `/api/v1/appointments`                 | GET    | List appointments (filter: date, status, mechanic, customer) |
| `/api/v1/appointments/:id`             | GET    | Appointment detail                                           |
| `/api/v1/appointments`                 | POST   | Book appointment                                             |
| `/api/v1/appointments/:id`             | PATCH  | Update appointment                                           |
| `/api/v1/appointments/:id/status`      | PATCH  | Transition status                                            |
| `/api/v1/appointments/:id/convert`     | POST   | Convert appointment → work order                             |
| `/api/v1/appointments/available-slots` | GET    | Get available time slots for a date + mechanic               |

**Status Transitions**:

```
Scheduled  →  Confirmed  →  Completed
    │             │
    └──→  Cancelled  ←──┘
    │
    └──→  No-Show
```

**Business Rules**:

- Cannot double-book a mechanic at the same time
- Appointment duration configurable (default 60 min + 15 min buffer)
- Converting to work order creates work order and updates status to Completed
- Available slots check against existing appointments and business hours

---

### Phase 5 — Supporting & Reporting Modules

#### Module: `payment`

| Endpoint               | Method | Description                                         |
| ---------------------- | ------ | --------------------------------------------------- |
| `/api/v1/payments`     | GET    | List payments (filter: date range, method, invoice) |
| `/api/v1/payments/:id` | GET    | Payment detail                                      |
| `/api/v1/payments`     | POST   | Record payment against invoice                      |
| `/api/v1/payments/:id` | DELETE | Void/reverse payment                                |

**Business Rules**:

- Recording payment updates `invoices.amount_paid` and `invoices.balance_due` (transaction)
- Invoice status auto-recalculated after each payment
- Payment amount cannot exceed `balance_due`
- Voiding a payment reverses the invoice updates

---

#### Module: `service-history`

| Endpoint                             | Method | Description                                  |
| ------------------------------------ | ------ | -------------------------------------------- |
| `/api/v1/service-history`            | GET    | List history (filter by vehicle, date range) |
| `/api/v1/service-history/:vehicleId` | GET    | Full history for a vehicle                   |

**Business Rules**:

- Records are auto-created when a work order is marked Completed
- Read-only from API (no manual creation/deletion — integrity enforced)
- Denormalized for fast reads

---

#### Module: `expense`

| Endpoint                   | Method | Description                                          |
| -------------------------- | ------ | ---------------------------------------------------- |
| `/api/v1/expenses`         | GET    | List expenses (filter: category, date range, vendor) |
| `/api/v1/expenses/:id`     | GET    | Expense detail                                       |
| `/api/v1/expenses`         | POST   | Record expense                                       |
| `/api/v1/expenses/:id`     | PATCH  | Update expense                                       |
| `/api/v1/expenses/:id`     | DELETE | Delete expense                                       |
| `/api/v1/expenses/summary` | GET    | Expense totals by category for date range            |

---

#### Module: `dashboard`

Read-only aggregation endpoints — no mutations.

| Endpoint                                  | Method | Description                                                                            |
| ----------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `/api/v1/dashboard/summary`               | GET    | KPIs: today's appointments, open work orders, revenue this month, outstanding invoices |
| `/api/v1/dashboard/revenue`               | GET    | Revenue over time (daily/monthly, date range)                                          |
| `/api/v1/dashboard/work-orders-by-status` | GET    | Work order count grouped by status                                                     |
| `/api/v1/dashboard/mechanic-productivity` | GET    | Work orders completed & hours logged per mechanic                                      |
| `/api/v1/dashboard/top-services`          | GET    | Most-performed services in date range                                                  |
| `/api/v1/dashboard/inventory-alerts`      | GET    | Low-stock parts summary                                                                |
| `/api/v1/dashboard/revenue-vs-expenses`   | GET    | Profit overview for date range                                                         |

---

## 5. Module Internal Anatomy

Every module follows the **exact same internal structure**. Here's the anatomy using `customer` as an example:

### `customer.types.ts` — Type Definitions

```typescript
// DTOs (Data Transfer Objects) derived from Zod schemas
// Re-export inferred types from validation schemas
export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryDto = z.infer<typeof customerQuerySchema>;

// Response types
export interface CustomerWithRelations {
  // ... typed response shape
}
```

### `customer.validation.ts` — Zod Schemas

```typescript
import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).max(50),
    last_name: z.string().min(1).max(50),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(1).max(20),
    address: z.string().optional(),
    city: z.string().max(50).optional(),
    postal_code: z.string().max(10).optional(),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: createCustomerSchema.shape.body.partial(),
  params: z.object({ id: z.coerce.number().int().positive() }),
});

export const customerQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    sortBy: z
      .enum(["first_name", "last_name", "date_registered", "created_at"])
      .default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});
```

### `customer.service.ts` — Business Logic

```typescript
// Depends on: Prisma singleton (injected/imported)
// Contains: ALL business logic and DB operations
// Does NOT know about Express (no req/res)
// Returns: data or throws AppError subclasses

class CustomerService {
  async findAll(query: CustomerQueryDto) {
    /* ... */
  }
  async findById(id: number) {
    /* ... throws NotFoundError */
  }
  async create(data: CreateCustomerDto) {
    /* ... throws ConflictError on duplicate email */
  }
  async update(id: number, data: UpdateCustomerDto) {
    /* ... */
  }
  async delete(id: number) {
    /* ... soft delete */
  }
  async getVehicles(customerId: number) {
    /* ... */
  }
  async getWorkOrders(customerId: number) {
    /* ... */
  }
}
```

### `customer.controller.ts` — HTTP Orchestration

```typescript
// Depends on: CustomerService
// Responsibility: Extract data from req, call service, shape response
// Does NOT contain business logic

class CustomerController {
  async getAll(req: Request, res: Response) {
    const data = await customerService.findAll(req.query);
    res.json(apiResponse.success(data, "Customers retrieved"));
  }
  async getById(req: Request, res: Response) {
    /* ... */
  }
  async create(req: Request, res: Response) {
    /* ... 201 */
  }
  async update(req: Request, res: Response) {
    /* ... */
  }
  async delete(req: Request, res: Response) {
    /* ... 204 */
  }
}
```

### `customer.routes.ts` — Route Definitions

```typescript
// Composes: middleware chain → controller method
const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "receptionist"),
  validate(customerQuerySchema),
  controller.getAll,
);
router.get("/:id", authenticate, validate(getByIdSchema), controller.getById);
router.post(
  "/",
  authenticate,
  authorize("admin", "manager", "receptionist"),
  validate(createCustomerSchema),
  controller.create,
);
router.patch(
  "/:id",
  authenticate,
  validate(updateCustomerSchema),
  controller.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  controller.delete,
);

router.get("/:id/vehicles", authenticate, controller.getVehicles);
router.get("/:id/work-orders", authenticate, controller.getWorkOrders);

export default router;
```

### `index.ts` — Module Public API

```typescript
// Single export point — app.ts only imports this
export { default as customerRoutes } from "./customer.routes";
```

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization

| Concern           | Implementation                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Authentication    | JWT Bearer token in `Authorization` header; `authenticate` middleware verifies & decodes |
| Authorization     | `authorize(...allowedRoles)` middleware checks `req.user.role` against allowed roles     |
| Password Security | bcrypt with 12 salt rounds                                                               |
| Token Refresh     | (Phase 2 enhancement) Refresh token rotation                                             |

**Role Hierarchy**:

```
admin       →  Full access to everything
manager     →  Full access except user management
mechanic    →  Read customers/vehicles, manage assigned work orders
receptionist →  Manage customers, vehicles, appointments
```

### 6.2 Validation (Zod)

The `validate` middleware factory:

```
validate(schema) → parses req.body + req.params + req.query
                 → On success: attaches parsed (typed) data, calls next()
                 → On failure: throws ValidationError with field-level details
```

Every module defines its own Zod schemas in `*.validation.ts`. Schemas are **co-located** with the module they belong to.

### 6.3 Error Handling

```
Thrown Error (anywhere)
     │
     ▼
asyncHandler catches it
     │
     ▼
Global errorHandler middleware
     │
     ├── AppError subclass?  →  Use its statusCode + message
     ├── Prisma error?       →  Map to appropriate HTTP status (e.g., unique constraint → 409)
     ├── Zod error?          →  400 with field-level details
     └── Unknown error?      →  500 Internal Server Error (log full stack, return generic message)
```

**Standard error response**:

```json
{
  "success": false,
  "message": "Customer with this email already exists",
  "error": {
    "code": "CONFLICT",
    "details": [...]
  }
}
```

### 6.4 Logging

- **HTTP requests**: Morgan in `dev` format (development) / `combined` (production)
- **Application logs**: Simple logger utility (console-based for now; can swap to Winston/Pino later)
- **Error logs**: Full stack traces in development, sanitized in production

### 6.5 Rate Limiting

- Global: 100 requests per 15 minutes per IP (configurable via env)
- Auth endpoints: Stricter — 10 requests per 15 minutes (brute force protection)

---

## 7. Database Strategy

### 7.1 Prisma as the ORM

- **Single source of truth**: `prisma/schema.prisma` defines all models
- **Migrations**: `prisma migrate dev` for development, `prisma migrate deploy` for production
- **Seeding**: `prisma/seed.ts` populates sample data (from the SQL sample data)
- **Type safety**: Prisma Client generates TypeScript types — no manual type sync

### 7.2 Singleton Pattern

```typescript
// src/common/database/prisma.ts
import { PrismaClient } from "@prisma/client";

class Database {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "warn", "error"]
            : ["error"],
      });
    }
    return Database.instance;
  }

  static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
    }
  }
}

export const prisma = Database.getInstance();
export default Database;
```

### 7.3 Transactions

Used for operations that span multiple tables:

- Adding/removing parts from work orders (update work_order_parts + parts.quantity_in_stock)
- Recording payments (update payments + invoices.amount_paid + invoices.balance_due + invoices.status)
- Receiving purchase orders (update purchase_orders.status + parts.quantity_in_stock)
- Completing work orders (update work_order + create service_history)

### 7.4 Soft Deletes

For production data safety, critical entities use `is_active: Boolean @default(true)` instead of hard deletes:

- Customers
- Vehicles
- Employees
- Parts
- Services

Service layer filters `where: { is_active: true }` by default.

---

## 8. API Design Conventions

### 8.1 URL Structure

```
Base:   /api/v1
Format: /api/v1/{resource}
        /api/v1/{resource}/:id
        /api/v1/{resource}/:id/{sub-resource}
        /api/v1/{resource}/:id/{action}
```

### 8.2 HTTP Methods

| Method | Usage                                |
| ------ | ------------------------------------ |
| GET    | Retrieve resource(s) — never mutates |
| POST   | Create resource or trigger action    |
| PATCH  | Partial update                       |
| DELETE | Soft-delete or remove                |

### 8.3 Standard Response Envelope

**Success**:

```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Single resource**:

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": { ... }
}
```

**Error**:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

### 8.4 Query Parameters (GET list endpoints)

| Param                     | Type            | Default      | Description                                      |
| ------------------------- | --------------- | ------------ | ------------------------------------------------ |
| `page`                    | int             | 1            | Page number                                      |
| `limit`                   | int             | 20           | Items per page (max 100)                         |
| `search`                  | string          | —            | Full-text search across relevant fields          |
| `sortBy`                  | string          | `created_at` | Field to sort by                                 |
| `sortOrder`               | `asc` \| `desc` | `desc`       | Sort direction                                   |
| (module-specific filters) | varies          | —            | e.g., `status`, `priority`, `dateFrom`, `dateTo` |

---

## 9. Error Handling Strategy

### 9.1 Custom Error Classes

```
AppError (base)
├── ValidationError       (400)
├── UnauthorizedError     (401)
├── ForbiddenError        (403)
├── NotFoundError         (404)
├── ConflictError         (409)
└── InternalServerError   (500)
```

### 9.2 Prisma Error Mapping

| Prisma Error Code              | HTTP Status | Mapped To       |
| ------------------------------ | ----------- | --------------- |
| P2002 (Unique constraint)      | 409         | ConflictError   |
| P2025 (Record not found)       | 404         | NotFoundError   |
| P2003 (Foreign key constraint) | 400         | ValidationError |

### 9.3 Zod Error Formatting

Zod errors are transformed into a flat array of `{ field, message }` objects for the API consumer.

---

## 10. Testing Strategy

> Tests are written **per module**, co-located or in a parallel `__tests__/` folder.

### 10.1 Unit Tests

- **Service layer**: Mock Prisma client, test business logic in isolation
- **Validation schemas**: Test Zod schemas with valid/invalid inputs
- **Utilities**: Test helpers (pagination, invoice number generator, etc.)

### 10.2 Integration Tests

- **Route-level**: Supertest against Express app with a test database
- **Database**: Use Prisma with a test PostgreSQL database (Docker)
- **Seed**: Each test suite seeds its own data and cleans up

### 10.3 Test Structure

```
backend/
├── src/modules/customer/
│   ├── __tests__/
│   │   ├── customer.service.test.ts
│   │   ├── customer.controller.test.ts
│   │   └── customer.validation.test.ts
```

---

## 11. Phase-by-Phase Execution Roadmap

### Phase 0 — Foundation (Est. 2–3 days)

| #    | Task                                                               | Files                                                  |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| 0.1  | Project init, install deps, tsconfig, eslint, prettier             | Root config files                                      |
| 0.2  | Environment config with Zod validation                             | `config/`                                              |
| 0.3  | Prisma schema (all models, relations, enums, indexes)              | `prisma/schema.prisma`                                 |
| 0.4  | Run initial migration                                              | `prisma/migrations/`                                   |
| 0.5  | Singleton Prisma client                                            | `common/database/prisma.ts`                            |
| 0.6  | Express app setup (global middlewares)                             | `app.ts`, `server.ts`                                  |
| 0.7  | Error classes & global error handler                               | `common/errors/`, `common/middlewares/errorHandler.ts` |
| 0.8  | Shared utilities (asyncHandler, apiResponse, pagination, validate) | `common/utils/`, `common/middlewares/validate.ts`      |
| 0.9  | Auth module (register, login, me, change-password)                 | `modules/auth/`                                        |
| 0.10 | Auth middlewares (authenticate, authorize)                         | `common/middlewares/`                                  |
| 0.11 | Seed script with sample data                                       | `prisma/seed.ts`                                       |
| 0.12 | Dockerfile + verify docker-compose works                           | `Dockerfile`                                           |

**Deliverable**: Server starts, auth works, health-check endpoint responds, DB is seeded.

---

### Phase 1 — Core Entities (Est. 3–4 days)

| #   | Task                                         | Module                     |
| --- | -------------------------------------------- | -------------------------- |
| 1.1 | Customer CRUD + search + pagination          | `modules/customer/`        |
| 1.2 | Employee CRUD + role filtering               | `modules/employee/`        |
| 1.3 | Service Catalog (categories + services) CRUD | `modules/service-catalog/` |

**Deliverable**: Can manage customers, employees, and service catalog via API.

---

### Phase 2 — Dependent Entities (Est. 2–3 days)

| #   | Task                                  | Module              |
| --- | ------------------------------------- | ------------------- |
| 2.1 | Vehicle CRUD + owner linking + search | `modules/vehicle/`  |
| 2.2 | Supplier CRUD                         | `modules/supplier/` |

**Deliverable**: Can manage vehicles linked to customers, and suppliers.

---

### Phase 3 — Core Business Logic (Est. 5–7 days)

| #   | Task                                                                    | Module                |
| --- | ----------------------------------------------------------------------- | --------------------- |
| 3.1 | Parts/Inventory CRUD + low-stock + stock adjustments                    | `modules/inventory/`  |
| 3.2 | Work Order CRUD + status transitions                                    | `modules/work-order/` |
| 3.3 | Work Order Services sub-resource (add/update/remove)                    | `modules/work-order/` |
| 3.4 | Work Order Parts sub-resource (add/update/remove + inventory deduction) | `modules/work-order/` |
| 3.5 | Work Order cost recalculation logic                                     | `modules/work-order/` |

**Deliverable**: Full work order lifecycle works — create, add services/parts, complete, costs calculated, inventory updated.

---

### Phase 4 — Financial & Scheduling (Est. 4–5 days)

| #   | Task                                                                  | Module                    |
| --- | --------------------------------------------------------------------- | ------------------------- |
| 4.1 | Purchase Order CRUD + line items + receiving flow                     | `modules/purchase-order/` |
| 4.2 | Invoice generation from work orders + auto-numbering                  | `modules/invoice/`        |
| 4.3 | Appointment CRUD + status + slot availability + convert-to-work-order | `modules/appointment/`    |

**Deliverable**: Full purchasing flow, invoicing, and appointment booking.

---

### Phase 5 — Payments, History, Reporting (Est. 3–4 days)

| #   | Task                                                          | Module                     |
| --- | ------------------------------------------------------------- | -------------------------- |
| 5.1 | Payment recording + invoice balance updates                   | `modules/payment/`         |
| 5.2 | Service History (auto-populated on work order completion)     | `modules/service-history/` |
| 5.3 | Expense tracking CRUD + category summaries                    | `modules/expense/`         |
| 5.4 | Dashboard aggregation endpoints (KPIs, revenue, productivity) | `modules/dashboard/`       |

**Deliverable**: Complete backend — all business features operational.

---

### Phase 6 — Hardening (Est. 2–3 days)

| #   | Task                                                                            |
| --- | ------------------------------------------------------------------------------- |
| 6.1 | Write unit tests for all service layers                                         |
| 6.2 | Write integration tests for critical flows (work order lifecycle, payment flow) |
| 6.3 | Add request logging and monitoring hooks                                        |
| 6.4 | Security audit (input sanitization, SQL injection via Prisma, rate limiting)    |
| 6.5 | API documentation (Swagger/OpenAPI via comments or manual spec)                 |
| 6.6 | Performance review (N+1 queries, missing indexes, connection pooling)           |

**Deliverable**: Production-ready backend.

---

## Total Estimated Timeline

| Phase                                  | Duration | Cumulative |
| -------------------------------------- | -------- | ---------- |
| Phase 0 — Foundation                   | 2–3 days | 2–3 days   |
| Phase 1 — Core Entities                | 3–4 days | 5–7 days   |
| Phase 2 — Dependent Entities           | 2–3 days | 7–10 days  |
| Phase 3 — Core Business Logic          | 5–7 days | 12–17 days |
| Phase 4 — Financial & Scheduling       | 4–5 days | 16–22 days |
| Phase 5 — Payments, History, Reporting | 3–4 days | 19–26 days |
| Phase 6 — Hardening                    | 2–3 days | 21–29 days |

> **Total: ~4–6 weeks** (working full days) for a complete, production-ready backend.

---

## Summary of Key Architectural Decisions

| Decision       | Choice                                           | Rationale                                            |
| -------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Architecture   | Modular (per feature)                            | High cohesion, SOLID compliance, scalability         |
| Language       | TypeScript (strict)                              | Type safety, better DX, catch errors at compile time |
| Framework      | Express                                          | Lightweight, flexible, massive ecosystem             |
| ORM            | Prisma                                           | Type-safe, great migrations, auto-generated types    |
| Validation     | Zod                                              | TypeScript-first, schema inference, composable       |
| Auth           | JWT + bcrypt                                     | Stateless, scalable, industry standard               |
| DB Access      | Singleton PrismaClient                           | Connection pooling, single source, no leaks          |
| Error Handling | Custom error classes + global handler            | Consistent API responses, centralized logging        |
| Soft Deletes   | `is_active` flag on critical tables              | Data safety, audit trail, referential integrity      |
| API Format     | JSON envelope `{ success, message, data, meta }` | Consistent, predictable for frontend consumption     |
