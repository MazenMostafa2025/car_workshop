# Car Workshop Management System — Frontend Implementation Plan

> **Architecture**: Next.js 14 App Router · Feature-Based Modules · Server & Client Components  
> **Stack**: Next.js 14 · React 18 · TypeScript · Tailwind CSS · Radix UI · React Query · Zustand · React Hook Form + Zod  
> **Backend API**: Express REST API on `http://localhost:4000` (97 endpoints across 16 modules)  
> **Principles**: Component-Driven · Type-Safe · Optimistic UI · Mobile-Responsive

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Foundation Layer (Phase 0)](#3-foundation-layer-phase-0)
4. [Page & Feature Breakdown by Phase](#4-page--feature-breakdown-by-phase)
5. [Component Architecture](#5-component-architecture)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [State Management Strategy](#7-state-management-strategy)
8. [API Integration Layer](#8-api-integration-layer)
9. [Form Handling Strategy](#9-form-handling-strategy)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Testing Strategy](#11-testing-strategy)
12. [Phase-by-Phase Execution Roadmap](#12-phase-by-phase-execution-roadmap)

---

## 1. Architecture Overview

### 1.1 Why Next.js App Router?

Next.js 14 App Router provides the ideal architecture for this workshop management system:

```
Traditional SPA (❌)                      Next.js App Router (✅)
──────────────────────                    ──────────────────────────
- All JS shipped to client                - Server Components by default (smaller bundle)
- Loading spinner on every page           - Instant page loads with streaming
- Client-side auth checks only            - Server-side auth middleware + layout guards
- Manual code splitting                   - Automatic route-based code splitting
- SEO requires extra setup                - Built-in SEO support
- No nested layouts                       - Nested layouts preserve state across navigation
```

**Key Decisions**:
- **Server Components** for data-fetching pages (dashboard, lists) — zero JS shipped
- **Client Components** for interactive UI (forms, modals, tables with sorting/filtering)
- **Route Groups** for layout organization (auth pages vs. dashboard pages)
- **Parallel Routes** for modals and side panels (optional, Phase 2+)

### 1.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     NEXT.JS APP                          │
│                                                          │
│  ┌──────────────┐    ┌───────────────┐                   │
│  │ Server       │    │ Client        │                   │
│  │ Components   │    │ Components    │                   │
│  │ (pages,      │    │ (forms,       │                   │
│  │  layouts)    │    │  tables,      │                   │
│  └──────┬───────┘    │  modals)      │                   │
│         │            └───────┬───────┘                   │
│         │                    │                           │
│         │            ┌───────▼───────┐                   │
│         │            │ React Query   │                   │
│         │            │ (cache,       │                   │
│         │            │  mutations,   │                   │
│         │            │  optimistic)  │                   │
│         │            └───────┬───────┘                   │
│         │                    │                           │
│         │            ┌───────▼───────┐                   │
│         └───────────►│  API Client   │                   │
│                      │  (Axios)      │                   │
│                      └───────┬───────┘                   │
│                              │                           │
└──────────────────────────────┼───────────────────────────┘
                               │  HTTP (JSON)
                               ▼
                    ┌──────────────────────┐
                    │  Express Backend     │
                    │  localhost:4000      │
                    │  /api/v1/*           │
                    └──────────────────────┘
```

### 1.3 Component Hierarchy Pattern

```
Page (Server Component)
  └── Layout (Server — sidebar, header)
       └── PageHeader (Server — title, breadcrumbs, actions)
            └── DataTable (Client — sorting, filtering, pagination)
                 ├── TableToolbar (Client — search, filters, bulk actions)
                 ├── TableBody (Client — rows with actions)
                 └── TablePagination (Client — page controls)
            └── FormDialog (Client — create/edit modals)
                 └── Form (Client — React Hook Form + Zod)
```

### 1.4 Authentication Flow

```
User visits any /dashboard/* route
         │
         ▼
  Next.js Middleware
  (middleware.ts)
         │
    Has JWT cookie? ──── No ───► Redirect to /login
         │
        Yes
         │
         ▼
   Layout fetches /auth/me
   (validates token server-side)
         │
   Valid? ──── No ───► Clear cookie, redirect to /login
         │
        Yes
         │
         ▼
   Render page with user context
   (role available for conditional UI)
```

---

## 2. Folder Structure

```
frontend/
├── public/
│   ├── logo.svg                       # Workshop logo
│   ├── favicon.ico
│   └── images/                        # Static images
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (html, body, providers)
│   │   ├── loading.tsx                # Global loading UI
│   │   ├── not-found.tsx              # 404 page
│   │   ├── error.tsx                  # Global error boundary
│   │   │
│   │   ├── (auth)/                    # Auth route group (no sidebar)
│   │   │   ├── layout.tsx             # Centered card layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Login page
│   │   │   └── forgot-password/
│   │   │       └── page.tsx           # (Future) Password reset
│   │   │
│   │   └── (dashboard)/               # Dashboard route group (with sidebar)
│   │       ├── layout.tsx             # Sidebar + header + main area
│   │       ├── page.tsx               # Dashboard home (/dashboard)
│   │       │
│   │       ├── customers/
│   │       │   ├── page.tsx           # Customer list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Customer detail
│   │       │   └── loading.tsx        # Skeleton loader
│   │       │
│   │       ├── vehicles/
│   │       │   ├── page.tsx           # Vehicle list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Vehicle detail + service history
│   │       │   └── loading.tsx
│   │       │
│   │       ├── employees/
│   │       │   ├── page.tsx           # Employee list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Employee detail + schedule
│   │       │   └── loading.tsx
│   │       │
│   │       ├── services/
│   │       │   ├── page.tsx           # Service catalog (categories + services)
│   │       │   └── loading.tsx
│   │       │
│   │       ├── work-orders/
│   │       │   ├── page.tsx           # Work order list (kanban or table)
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Work order detail (services, parts, costs)
│   │       │   ├── new/
│   │       │   │   └── page.tsx       # Create work order (multi-step form)
│   │       │   └── loading.tsx
│   │       │
│   │       ├── appointments/
│   │       │   ├── page.tsx           # Appointment calendar/list view
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Appointment detail
│   │       │   └── loading.tsx
│   │       │
│   │       ├── inventory/
│   │       │   ├── page.tsx           # Parts inventory list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Part detail
│   │       │   ├── low-stock/
│   │       │   │   └── page.tsx       # Low stock alerts view
│   │       │   └── loading.tsx
│   │       │
│   │       ├── suppliers/
│   │       │   ├── page.tsx           # Supplier list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Supplier detail + parts
│   │       │   └── loading.tsx
│   │       │
│   │       ├── purchase-orders/
│   │       │   ├── page.tsx           # PO list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # PO detail with line items
│   │       │   ├── new/
│   │       │   │   └── page.tsx       # Create PO form
│   │       │   └── loading.tsx
│   │       │
│   │       ├── invoices/
│   │       │   ├── page.tsx           # Invoice list
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx       # Invoice detail + payments
│   │       │   ├── outstanding/
│   │       │   │   └── page.tsx       # Outstanding invoices view
│   │       │   └── loading.tsx
│   │       │
│   │       ├── payments/
│   │       │   ├── page.tsx           # Payment history
│   │       │   └── loading.tsx
│   │       │
│   │       ├── expenses/
│   │       │   ├── page.tsx           # Expense list + summary
│   │       │   └── loading.tsx
│   │       │
│   │       ├── reports/
│   │       │   ├── page.tsx           # Reports hub
│   │       │   ├── revenue/
│   │       │   │   └── page.tsx       # Revenue analytics
│   │       │   ├── productivity/
│   │       │   │   └── page.tsx       # Mechanic productivity
│   │       │   └── loading.tsx
│   │       │
│   │       └── settings/
│   │           └── page.tsx           # User settings / change password
│   │
│   ├── components/
│   │   ├── ui/                        # Primitive UI components (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── sidebar.tsx            # Collapsible sidebar navigation
│   │   │   ├── header.tsx             # Top header (user menu, notifications)
│   │   │   ├── breadcrumbs.tsx        # Dynamic breadcrumb trail
│   │   │   ├── page-header.tsx        # Page title + action buttons
│   │   │   └── mobile-nav.tsx         # Mobile hamburger navigation
│   │   │
│   │   ├── data/                      # Data display components
│   │   │   ├── data-table.tsx         # Reusable sortable/filterable table
│   │   │   ├── data-table-toolbar.tsx # Search + filter bar
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-column-header.tsx
│   │   │   ├── stat-card.tsx          # Dashboard KPI card
│   │   │   ├── status-badge.tsx       # Color-coded status badges
│   │   │   ├── empty-state.tsx        # "No data" placeholder
│   │   │   └── loading-table.tsx      # Table skeleton loader
│   │   │
│   │   ├── forms/                     # Form components
│   │   │   ├── form-field.tsx         # Wrapper: label + input + error
│   │   │   ├── form-select.tsx        # Wrapper: label + select + error
│   │   │   ├── form-date-picker.tsx   # Wrapper: label + date picker + error
│   │   │   ├── form-textarea.tsx      # Wrapper: label + textarea + error
│   │   │   ├── search-input.tsx       # Debounced search input
│   │   │   └── confirm-dialog.tsx     # "Are you sure?" delete confirmation
│   │   │
│   │   ├── charts/                    # Data visualization
│   │   │   ├── revenue-chart.tsx      # Line/area chart for revenue
│   │   │   ├── status-pie-chart.tsx   # Pie chart for WO statuses
│   │   │   ├── bar-chart.tsx          # Generic bar chart
│   │   │   └── chart-wrapper.tsx      # Recharts responsive container
│   │   │
│   │   └── features/                  # Feature-specific compound components
│   │       ├── customer-form.tsx      # Create/Edit customer form
│   │       ├── customer-select.tsx    # Searchable customer dropdown
│   │       ├── vehicle-form.tsx
│   │       ├── vehicle-select.tsx
│   │       ├── employee-form.tsx
│   │       ├── mechanic-select.tsx    # Searchable mechanic dropdown
│   │       ├── service-form.tsx
│   │       ├── service-select.tsx
│   │       ├── part-select.tsx        # Searchable part dropdown
│   │       ├── supplier-select.tsx
│   │       ├── work-order-form.tsx
│   │       ├── work-order-status-flow.tsx  # Visual status transition
│   │       ├── work-order-services-table.tsx
│   │       ├── work-order-parts-table.tsx
│   │       ├── appointment-form.tsx
│   │       ├── appointment-calendar.tsx
│   │       ├── invoice-detail.tsx
│   │       ├── payment-form.tsx
│   │       ├── expense-form.tsx
│   │       └── purchase-order-form.tsx
│   │
│   ├── lib/                           # Utilities and configuration
│   │   ├── api-client.ts             # Axios instance with interceptors
│   │   ├── auth.ts                   # Auth helpers (token storage, guards)
│   │   ├── utils.ts                  # cn(), formatCurrency(), formatDate()
│   │   ├── constants.ts              # Status labels, role labels, colors
│   │   └── validations/              # Shared Zod schemas (mirrors backend)
│   │       ├── customer.ts
│   │       ├── vehicle.ts
│   │       ├── employee.ts
│   │       ├── work-order.ts
│   │       ├── appointment.ts
│   │       ├── invoice.ts
│   │       ├── payment.ts
│   │       ├── expense.ts
│   │       ├── inventory.ts
│   │       ├── supplier.ts
│   │       ├── purchase-order.ts
│   │       └── auth.ts
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-auth.ts               # Auth state + login/logout
│   │   ├── use-debounce.ts           # Debounce hook for search
│   │   ├── use-pagination.ts         # URL-synced pagination state
│   │   ├── use-confirmation.ts       # Confirmation dialog state
│   │   └── use-media-query.ts        # Responsive breakpoints
│   │
│   ├── services/                      # API service functions (per module)
│   │   ├── auth.service.ts           # login(), me(), changePassword()
│   │   ├── customer.service.ts       # getCustomers(), getCustomer(), createCustomer()...
│   │   ├── vehicle.service.ts
│   │   ├── employee.service.ts
│   │   ├── service-catalog.service.ts
│   │   ├── work-order.service.ts
│   │   ├── inventory.service.ts
│   │   ├── supplier.service.ts
│   │   ├── purchase-order.service.ts
│   │   ├── invoice.service.ts
│   │   ├── appointment.service.ts
│   │   ├── payment.service.ts
│   │   ├── expense.service.ts
│   │   ├── service-history.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── queries/                       # React Query hooks (per module)
│   │   ├── use-customers.ts          # useCustomers(), useCustomer(), useCreateCustomer()...
│   │   ├── use-vehicles.ts
│   │   ├── use-employees.ts
│   │   ├── use-services.ts
│   │   ├── use-work-orders.ts
│   │   ├── use-inventory.ts
│   │   ├── use-suppliers.ts
│   │   ├── use-purchase-orders.ts
│   │   ├── use-invoices.ts
│   │   ├── use-appointments.ts
│   │   ├── use-payments.ts
│   │   ├── use-expenses.ts
│   │   ├── use-service-history.ts
│   │   └── use-dashboard.ts
│   │
│   ├── stores/                        # Zustand stores (minimal global state)
│   │   ├── auth-store.ts             # User, token, isAuthenticated
│   │   ├── sidebar-store.ts          # Sidebar collapsed/expanded
│   │   └── ui-store.ts              # Theme, mobile nav open, etc.
│   │
│   ├── types/                         # TypeScript type definitions
│   │   ├── api.ts                    # ApiResponse<T>, PaginatedResponse<T>, PaginationMeta
│   │   ├── auth.ts                   # User, LoginRequest, LoginResponse
│   │   ├── customer.ts              # Customer, CreateCustomerDto, UpdateCustomerDto
│   │   ├── vehicle.ts
│   │   ├── employee.ts
│   │   ├── work-order.ts            # WorkOrder, WorkOrderService, WorkOrderPart, statuses
│   │   ├── service-catalog.ts       # ServiceCategory, Service
│   │   ├── inventory.ts             # Part, StockAdjustment
│   │   ├── supplier.ts
│   │   ├── purchase-order.ts        # PurchaseOrder, PurchaseOrderItem
│   │   ├── invoice.ts
│   │   ├── appointment.ts
│   │   ├── payment.ts
│   │   ├── expense.ts
│   │   ├── service-history.ts
│   │   └── dashboard.ts             # Summary, Revenue, WOByStatus, etc.
│   │
│   ├── providers/                     # React context providers
│   │   ├── query-provider.tsx        # React Query QueryClientProvider
│   │   ├── auth-provider.tsx         # Auth context (token refresh, guards)
│   │   └── toast-provider.tsx        # Sonner toast notifications
│   │
│   └── middleware.ts                  # Next.js edge middleware (auth redirect)
│
├── .env.local                         # NEXT_PUBLIC_API_URL=http://localhost:4000
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
└── README.md
```

---

## 3. Foundation Layer (Phase 0)

> Build the skeleton before any business pages. Everything below is a prerequisite.

### 3.1 Project Initialization

| Step | Task                                                                    |
| ---- | ----------------------------------------------------------------------- |
| 0.1  | Initialize Next.js 14 project with TypeScript + Tailwind + App Router   |
| 0.2  | Install all dependencies (see `frontend-package.json`)                  |
| 0.3  | Configure `tsconfig.json` with path alias `@/*` → `src/*`              |
| 0.4  | Configure `tailwind.config.ts` with custom theme (colors, fonts)        |
| 0.5  | Configure ESLint + Prettier                                             |
| 0.6  | Set up environment variables (`.env.local`, `.env.example`)             |

### 3.2 UI Component Library (shadcn/ui Pattern)

Build primitive components wrapping Radix UI + Tailwind + CVA (class-variance-authority):

| Priority | Components                                                   | Radix Primitive        |
| -------- | ------------------------------------------------------------ | ---------------------- |
| P0       | Button, Input, Label, Textarea, Select                       | Radix Select           |
| P0       | Dialog, AlertDialog                                          | Radix Dialog/Alert     |
| P0       | Card, Badge, Separator, Skeleton                             | —                      |
| P0       | Table (header, body, row, cell)                              | —                      |
| P1       | DropdownMenu, Popover, Tooltip                               | Radix primitives       |
| P1       | Tabs, Toast (Sonner), Calendar, DatePicker                   | Radix Tabs, DayPicker  |
| P2       | Avatar, Switch, Checkbox, RadioGroup                         | Radix primitives       |

**Why this pattern?**
- Radix provides **accessibility** (keyboard nav, ARIA, focus management)
- Tailwind provides **styling** (no CSS-in-JS runtime cost)
- CVA provides **variants** (size, color, state)
- Components are **owned by us** — no dependency on a UI library version

### 3.3 Layout System

```
Root Layout (app/layout.tsx)
├── Providers (QueryClient, Auth, Toast)
│
├── Auth Layout (app/(auth)/layout.tsx)
│   └── Centered card with logo (login, forgot-password)
│
└── Dashboard Layout (app/(dashboard)/layout.tsx)
    ├── Sidebar (collapsible, role-aware navigation)
    ├── Header (user menu, breadcrumbs, notifications bell)
    └── Main Content Area (pages render here)
```

**Sidebar Navigation Items** (role-dependent visibility):

| Icon | Label            | Path               | Roles                             |
| ---- | ---------------- | ------------------ | --------------------------------- |
| 📊   | Dashboard        | `/`                | All                               |
| 👥   | Customers        | `/customers`       | Admin, Manager, Receptionist      |
| 🚗   | Vehicles         | `/vehicles`        | Admin, Manager, Receptionist      |
| 👷   | Employees        | `/employees`       | Admin, Manager                    |
| 🔧   | Services         | `/services`        | Admin, Manager                    |
| 📋   | Work Orders      | `/work-orders`     | All                               |
| 📅   | Appointments     | `/appointments`    | Admin, Manager, Receptionist      |
| 📦   | Inventory        | `/inventory`       | Admin, Manager                    |
| 🏭   | Suppliers        | `/suppliers`       | Admin, Manager                    |
| 🛒   | Purchase Orders  | `/purchase-orders` | Admin, Manager                    |
| 💰   | Invoices         | `/invoices`        | Admin, Manager, Receptionist      |
| 💳   | Payments         | `/payments`        | Admin, Manager, Receptionist      |
| 💸   | Expenses         | `/expenses`        | Admin, Manager                    |
| 📈   | Reports          | `/reports`         | Admin, Manager                    |
| ⚙️   | Settings         | `/settings`        | All                               |

### 3.4 API Client

```typescript
// src/lib/api-client.ts
// Axios instance with:
// - baseURL from NEXT_PUBLIC_API_URL
// - Request interceptor: attach JWT from cookie/store
// - Response interceptor: handle 401 → redirect to login
// - Response interceptor: unwrap { success, data, meta } envelope
// - Error interceptor: transform to typed ApiError
```

### 3.5 Auth System

| Component              | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `middleware.ts`         | Next.js edge middleware — redirect unauthenticated to `/login`      |
| `auth-store.ts`        | Zustand store — user, token, isAuthenticated, login(), logout()     |
| `auth-provider.tsx`    | On mount: check token validity, hydrate user, handle token refresh  |
| `use-auth.ts`          | Hook for components: user, role, isAdmin, login(), logout()         |
| `auth.service.ts`      | API calls: `POST /auth/login`, `GET /auth/me`, `PATCH /auth/change-password` |

**Token Storage**: HttpOnly cookie (set by backend) for security, with Zustand for client-side user state.

### 3.6 React Query Configuration

```typescript
// src/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30s before refetch
      gcTime: 5 * 60 * 1000,       // 5min garbage collection
      retry: 1,                     // Retry failed requests once
      refetchOnWindowFocus: false,  // Don't refetch on tab switch
    },
  },
});
```

### 3.7 Type Definitions

Mirror the backend API response types:

```typescript
// src/types/api.ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Array<{ field: string; message: string }>;
  };
}
```

### 3.8 Utility Helpers

| Helper                                  | Purpose                                             |
| --------------------------------------- | --------------------------------------------------- |
| `cn(...classes)`                        | Tailwind class merge (clsx + tailwind-merge)        |
| `formatCurrency(amount)`               | Format as `$1,234.56`                               |
| `formatDate(date)`                     | Format as `Feb 9, 2026`                             |
| `formatDateTime(date)`                 | Format as `Feb 9, 2026 2:30 PM`                     |
| `getStatusColor(status)`               | Map status → Tailwind color class                   |
| `getInitials(firstName, lastName)`     | For avatar fallbacks                                |
| `debounce(fn, ms)`                     | Search input debouncing                             |

---

## 4. Page & Feature Breakdown by Phase

### Phase 1 — Dashboard + Authentication (Foundation Screens)

#### Login Page (`/login`)

| Feature                     | Description                                    |
| --------------------------- | ---------------------------------------------- |
| Email + password form       | React Hook Form + Zod validation               |
| "Remember me" checkbox      | Persist token in cookie with longer expiry      |
| Error display               | Toast on invalid credentials                    |
| Loading state               | Disable button + spinner during API call        |
| Redirect                    | On success → `/` (dashboard)                   |

#### Dashboard Home (`/`)

| Widget                          | API Endpoint                              | Display                               |
| ------------------------------- | ----------------------------------------- | ------------------------------------- |
| KPI Summary Cards               | `GET /dashboard/summary`                  | 4 stat cards: appointments, open WOs, revenue, outstanding |
| Revenue Chart                   | `GET /dashboard/revenue`                  | Line/area chart (last 30 days)        |
| Work Orders by Status           | `GET /dashboard/work-orders-by-status`    | Donut/pie chart                       |
| Low Stock Alerts                | `GET /dashboard/inventory-alerts`         | Alert list with part name + qty       |
| Top Services                    | `GET /dashboard/top-services`             | Bar chart                             |
| Mechanic Productivity           | `GET /dashboard/mechanic-productivity`    | Horizontal bar chart                  |
| Revenue vs Expenses             | `GET /dashboard/revenue-vs-expenses`      | Comparison chart (optional Phase 2)   |

---

### Phase 2 — Core Entity Management (CRUD Pages)

#### Customers (`/customers`)

| Screen          | Features                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| **List**        | DataTable with search (name/phone/email), sortable columns, pagination, "New" button   |
| **Detail**      | Customer info card, tabs: Vehicles, Work Orders, Invoices. Edit/Delete actions          |
| **Create/Edit** | Modal form: firstName, lastName, email, phone, address, city, postalCode, notes         |
| **Delete**      | Confirmation dialog, soft-delete                                                       |

**API Endpoints Used**: `GET /customers`, `GET /customers/:id`, `POST /customers`, `PATCH /customers/:id`, `DELETE /customers/:id`

#### Employees (`/employees`)

| Screen          | Features                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| **List**        | DataTable with role filter, active/inactive toggle, search                              |
| **Detail**      | Employee info, tabs: Assigned Work Orders, Schedule                                    |
| **Create/Edit** | Modal form: name, email, phone, role (dropdown), specialization, hireDate, hourlyRate   |

**API Endpoints Used**: `GET /employees`, `GET /employees/:id`, `POST /employees`, `PATCH /employees/:id`, `DELETE /employees/:id`

#### Service Catalog (`/services`)

| Screen              | Features                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| **Combined View**   | Left: Category list (accordion/tree). Right: Services in selected category     |
| **Category CRUD**   | Inline add/edit/delete for categories                                          |
| **Service CRUD**    | Table with: name, category, basePrice, estimatedDuration, isActive             |
| **Create/Edit**     | Modal form: name, description, categoryId (select), basePrice, estimatedDuration |

**API Endpoints Used**: `GET /service-categories`, `POST /service-categories`, `PATCH /service-categories/:id`, `DELETE /service-categories/:id`, `GET /services`, `GET /services/:id`, `POST /services`, `PATCH /services/:id`, `DELETE /services/:id`

#### Vehicles (`/vehicles`)

| Screen          | Features                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| **List**        | DataTable with search (plate/VIN/make/model), filters                                  |
| **Detail**      | Vehicle info, owner link, tabs: Service History                                        |
| **Create/Edit** | Modal: customerId (searchable select), make, model, year, vin, licensePlate, color, mileage, engineType, transmissionType |

**API Endpoints Used**: `GET /vehicles`, `GET /vehicles/:id`, `POST /vehicles`, `PATCH /vehicles/:id`, `DELETE /vehicles/:id`, `GET /vehicles/:id/service-history`

#### Suppliers (`/suppliers`)

| Screen          | Features                                                                           |
| --------------- | ---------------------------------------------------------------------------------- |
| **List**        | DataTable with search, pagination                                                  |
| **Detail**      | Supplier info card, tab: Parts supplied                                             |
| **Create/Edit** | Modal: name, contactPerson, email, phone, address, city, postalCode                |

**API Endpoints Used**: `GET /suppliers`, `GET /suppliers/:id`, `POST /suppliers`, `PATCH /suppliers/:id`, `DELETE /suppliers/:id`, `GET /suppliers/:id/parts`

---

### Phase 3 — Core Business Logic (Complex Interactive Pages)

#### Inventory / Parts (`/inventory`)

| Screen              | Features                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| **List**            | DataTable: name, partNumber, category, supplier, stock, reorderLevel, price. Filter: low-stock toggle, category, supplier |
| **Detail**          | Part info, supplier link, stock levels, cost vs selling price                  |
| **Create/Edit**     | Modal: name, partNumber, description, category, supplierId (select), unitCost, sellingPrice, quantityInStock, reorderLevel, location |
| **Stock Adjust**    | Inline modal: adjustmentType (+/-), quantity, reason                           |
| **Low Stock View**  | `/inventory/low-stock` — filtered list of parts at/below reorder level         |
| **Inventory Value** | Card showing total cost + retail value                                         |

**API Endpoints Used**: `GET /parts`, `GET /parts/:id`, `POST /parts`, `PATCH /parts/:id`, `DELETE /parts/:id`, `GET /parts/low-stock`, `PATCH /parts/:id/adjust-stock`, `GET /parts/inventory-value`

#### Work Orders (`/work-orders`) — **Most Complex Page**

| Screen              | Features                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| **List**            | DataTable OR Kanban board (toggle). Filters: status, priority, mechanic, customer, date range. Quick status badges |
| **Detail**          | Header: status flow visualization, customer + vehicle info. Three tabs/sections: Services, Parts, Summary (costs) |
| **Create**          | Multi-step form: Step 1 (Customer + Vehicle select), Step 2 (Assign mechanic, set priority), Step 3 (Add services + parts). OR single-page form with sections |
| **Status Flow**     | Visual pipeline: Pending → In Progress → Completed. Transition buttons with confirmation |
| **Services Tab**    | Editable table: service name, mechanic, quantity, unitPrice, total. Add/remove rows |
| **Parts Tab**       | Editable table: part name, quantity, unitPrice, total. Add/remove rows (auto-deducts stock) |
| **Cost Summary**    | Auto-calculated: labor total, parts total, grand total                         |

**API Endpoints Used**: ALL work-order endpoints (14 total) — CRUD + status transition + services sub-resource + parts sub-resource

**UX Highlights**:
- Searchable dropdowns for customer, vehicle, mechanic, service, part selections
- Real-time cost calculation as services/parts are added
- Status transition with visual state machine
- Color-coded priority badges (Low=green, Medium=yellow, High=orange, Urgent=red)

#### Appointments (`/appointments`)

| Screen              | Features                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| **Calendar View**   | Monthly/weekly calendar showing appointments by mechanic (color-coded)         |
| **List View**       | DataTable: date, time, customer, vehicle, mechanic, status, notes              |
| **Create/Edit**     | Modal: date, startTime, endTime, customerId, vehicleId, mechanicId, serviceType, notes |
| **Available Slots** | When selecting mechanic + date, show available time slots from API             |
| **Status Flow**     | Scheduled → Confirmed → Completed / Cancelled / No-Show                       |
| **Convert to WO**   | Button on Completed appointments → creates work order (redirects)              |

**API Endpoints Used**: `GET /appointments`, `GET /appointments/:id`, `POST /appointments`, `PATCH /appointments/:id`, `PATCH /appointments/:id/status`, `GET /appointments/available-slots`, `POST /appointments/:id/convert`

---

### Phase 4 — Financial Management

#### Purchase Orders (`/purchase-orders`)

| Screen              | Features                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| **List**            | DataTable: PO number, supplier, status, orderDate, totalAmount                 |
| **Detail**          | PO header + line items table. Actions: Edit, Receive (marks received + updates inventory) |
| **Create/Edit**     | Supplier select, add line items (part select + quantity + unitCost), auto-total |
| **Receive Flow**    | Confirmation dialog → calls receive endpoint → stock updated                   |

**API Endpoints Used**: `GET /purchase-orders`, `GET /purchase-orders/:id`, `POST /purchase-orders`, `PATCH /purchase-orders/:id`, `PATCH /purchase-orders/:id/receive`, item sub-resource CRUD

#### Invoices (`/invoices`)

| Screen                | Features                                                                     |
| --------------------- | ---------------------------------------------------------------------------- |
| **List**              | DataTable: invoice#, customer, date, total, amountPaid, balanceDue, status   |
| **Detail**            | Invoice header, work order link, line items (services + parts), payment history. Actions: Edit (discount/tax), Record Payment |
| **Outstanding View**  | `/invoices/outstanding` — filtered list of unpaid/partially paid invoices     |
| **Generate**          | From work order detail page → "Generate Invoice" button                      |
| **Print/PDF**         | (Future) Print-friendly CSS or PDF generation                                |

**API Endpoints Used**: `GET /invoices`, `GET /invoices/:id`, `POST /invoices`, `PATCH /invoices/:id`, `GET /invoices/outstanding`

#### Payments (`/payments`)

| Screen          | Features                                                                           |
| --------------- | ---------------------------------------------------------------------------------- |
| **List**        | DataTable: date, invoice#, customer, amount, method                                |
| **Record**      | Modal from invoice detail: amount, paymentMethod (dropdown), paymentDate, reference |
| **Void**        | Confirmation dialog → reverses payment → updates invoice balance                   |

**API Endpoints Used**: `GET /payments`, `GET /payments/:id`, `POST /payments`, `DELETE /payments/:id`

#### Expenses (`/expenses`)

| Screen          | Features                                                                           |
| --------------- | ---------------------------------------------------------------------------------- |
| **List**        | DataTable: date, category, vendor, description, amount. Filter: category, date range |
| **Summary**     | Category breakdown (pie chart or table) for selected date range                    |
| **Create/Edit** | Modal: category (enum select), amount, vendor, description, expenseDate, reference  |

**API Endpoints Used**: `GET /expenses`, `GET /expenses/:id`, `POST /expenses`, `PATCH /expenses/:id`, `DELETE /expenses/:id`, `GET /expenses/summary`

---

### Phase 5 — Reports & Analytics

#### Reports Hub (`/reports`)

| Report Page              | Widgets                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| **Revenue** (`/reports/revenue`)     | Revenue over time (line chart), revenue vs expenses, date range filter |
| **Productivity** (`/reports/productivity`) | Mechanic work orders completed, hours logged, revenue generated |
| **Service History**      | Accessed from vehicle detail page — timeline of all services     |

**API Endpoints Used**: `GET /dashboard/revenue`, `GET /dashboard/revenue-vs-expenses`, `GET /dashboard/mechanic-productivity`, `GET /dashboard/top-services`, `GET /service-history`

---

### Phase 6 — Polish & Enhancement

| Feature                     | Description                                                        |
| --------------------------- | ------------------------------------------------------------------ |
| Dark mode toggle            | Tailwind dark mode with CSS variable theme                         |
| Mobile responsive           | All tables → card layout on mobile, collapsible sidebar            |
| Keyboard shortcuts          | `Ctrl+K` command palette for quick navigation                      |
| Bulk actions                | Multi-select rows for bulk status update, bulk delete              |
| Export to CSV               | Download table data as CSV/Excel                                   |
| Print views                 | Print-optimized CSS for invoices and work orders                   |
| Notifications               | Toast notifications for real-time updates                          |
| Settings page              | Change password, user preferences                                  |

---

## 5. Component Architecture

### 5.1 DataTable Pattern (Reused on Every List Page)

```
<DataTable>
├── Props:
│   ├── columns: ColumnDef[]         # Column definitions (header, accessor, cell renderer)
│   ├── data: T[]                    # Row data from React Query
│   ├── pagination: PaginationMeta   # Server-side pagination meta
│   ├── onPageChange(page)           # Callback for page navigation
│   ├── onSearch(query)              # Callback for search
│   ├── onSort(column, direction)    # Callback for sorting
│   ├── isLoading: boolean           # Show skeleton rows
│   ├── filters?: ReactNode          # Slot for custom filter dropdowns
│   └── actions?: ReactNode          # Slot for "New" button, bulk actions
│
├── Internal State:
│   └── (none — all state lifted to page via URL search params)
│
└── Renders:
    ├── Toolbar (search + filters + actions)
    ├── Table (sortable headers, data rows)
    └── Pagination (page controls)
```

### 5.2 Form Dialog Pattern (Reused for Create/Edit)

```
<FormDialog>
├── Props:
│   ├── open: boolean
│   ├── onClose()
│   ├── title: string
│   ├── mode: 'create' | 'edit'
│   ├── defaultValues?: Partial<T>
│   ├── onSubmit(data: T)
│   └── isLoading: boolean
│
├── Internal:
│   ├── React Hook Form with Zod resolver
│   ├── Field-level error display
│   └── Submit button with loading state
│
└── Renders:
    ├── Radix Dialog with animated overlay
    ├── Form fields (type-specific)
    └── Cancel + Submit buttons
```

### 5.3 Status Badge Pattern

```
<StatusBadge status="IN_PROGRESS" type="workOrder" />
→ Renders: <Badge variant="warning">In Progress</Badge>

Status color mapping:
  PENDING      → gray
  IN_PROGRESS  → blue
  COMPLETED    → green
  CANCELLED    → red
  OVERDUE      → orange
  PAID         → green
  UNPAID       → red
  PARTIAL      → yellow
```

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization

| Concern              | Implementation                                                              |
| -------------------- | --------------------------------------------------------------------------- |
| Route protection     | `middleware.ts` checks cookie on every `/(dashboard)/*` request             |
| Token management     | JWT stored in httpOnly cookie (set by backend) + Zustand for user state     |
| Role-based UI        | Sidebar items filtered by role; action buttons hidden for unauthorized roles |
| Session expiry       | 401 response interceptor → clear state → redirect to `/login`              |

**Role → Visible Pages Mapping**:

| Role          | Visible Navigation                                                                   |
| ------------- | ------------------------------------------------------------------------------------ |
| `admin`       | Everything                                                                           |
| `manager`     | Everything except employee create/delete                                              |
| `mechanic`    | Dashboard, My Work Orders, Assigned Appointments                                      |
| `receptionist`| Dashboard, Customers, Vehicles, Appointments, Invoices, Payments                      |

### 6.2 Error Handling

| Layer                  | Strategy                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| API errors (4xx)       | Toast notification with error message from backend                      |
| API errors (5xx)       | Toast: "Something went wrong. Please try again."                        |
| Network errors         | Toast: "Unable to connect to server. Check your connection."            |
| Form validation errors | Inline field-level errors (Zod + React Hook Form)                       |
| Page-level errors      | `error.tsx` boundary with retry button                                  |
| 404 pages              | `not-found.tsx` with navigation back                                    |

### 6.3 Loading States

| Context              | Implementation                                                         |
| -------------------- | ---------------------------------------------------------------------- |
| Page transitions     | `loading.tsx` per route — skeleton layout matching page shape           |
| Table data           | Skeleton rows (react-loading-skeleton) in DataTable                    |
| Form submission      | Button disabled + spinner; optimistic UI for simple mutations           |
| Initial auth check   | Full-screen spinner on app mount until auth hydrated                    |

### 6.4 Toast Notifications

Using **Sonner** for toast notifications:

| Event                     | Toast Type | Message Example                          |
| ------------------------- | ---------- | ---------------------------------------- |
| Successful create         | Success    | "Customer created successfully"          |
| Successful update         | Success    | "Work order updated"                     |
| Successful delete         | Success    | "Expense deleted"                        |
| API error                 | Error      | Backend error message (from response)    |
| Network error             | Error      | "Connection lost. Retrying..."           |
| Status transition         | Info       | "Work order moved to In Progress"        |

### 6.5 URL-Driven State (Search Params)

All list pages sync their state with URL search params for shareable/bookmarkable URLs:

```
/work-orders?page=2&limit=20&status=IN_PROGRESS&search=toyota&sortBy=createdAt&sortOrder=desc
```

Benefits:
- Browser back/forward works correctly
- Pages are shareable via URL
- Refresh preserves filters
- React Query uses search params as cache keys

---

## 7. State Management Strategy

### 7.1 State Categories

| Category                 | Tool                 | Examples                                        |
| ------------------------ | -------------------- | ----------------------------------------------- |
| **Server state**         | React Query          | Customer list, work order detail, dashboard data |
| **URL state**            | Next.js searchParams | Page, limit, search, filters, sort              |
| **Global client state**  | Zustand              | Auth user, sidebar collapsed, theme             |
| **Local component state**| useState/useReducer  | Modal open, form dirty, selected rows           |
| **Form state**           | React Hook Form      | Field values, validation, touched, dirty        |

### 7.2 React Query Key Convention

```typescript
// Consistent key structure for cache management
const queryKeys = {
  customers: {
    all:    ['customers'],
    list:   (params) => ['customers', 'list', params],
    detail: (id) => ['customers', 'detail', id],
  },
  workOrders: {
    all:      ['work-orders'],
    list:     (params) => ['work-orders', 'list', params],
    detail:   (id) => ['work-orders', 'detail', id],
    services: (woId) => ['work-orders', woId, 'services'],
    parts:    (woId) => ['work-orders', woId, 'parts'],
  },
  // ... same pattern for all modules
};
```

### 7.3 Mutation → Cache Invalidation

| Mutation                   | Invalidate                                    |
| -------------------------- | --------------------------------------------- |
| Create customer            | `['customers', 'list']`                       |
| Update customer            | `['customers', 'detail', id]` + list          |
| Delete customer            | `['customers', 'list']`                       |
| Add service to WO          | `['work-orders', woId, 'services']` + detail  |
| Add part to WO             | `['work-orders', woId, 'parts']` + detail + `['parts']` (stock changed) |
| Record payment             | `['payments']` + `['invoices', invoiceId]`     |
| Transition WO status       | `['work-orders']` (all — status counts change) |
| Receive purchase order     | `['purchase-orders', id]` + `['parts']` (stock changed) |

---

## 8. API Integration Layer

### 8.1 Service Layer Pattern

Each module has a service file that wraps API calls:

```typescript
// src/services/customer.service.ts
import { api } from '@/lib/api-client';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer';
import { PaginatedResponse, ApiResponse } from '@/types/api';

export const customerService = {
  getAll:    (params) => api.get<PaginatedResponse<Customer>>('/customers', { params }),
  getById:   (id)     => api.get<ApiResponse<Customer>>(`/customers/${id}`),
  create:    (data)   => api.post<ApiResponse<Customer>>('/customers', data),
  update:    (id, data) => api.patch<ApiResponse<Customer>>(`/customers/${id}`, data),
  delete:    (id)     => api.delete(`/customers/${id}`),
  getVehicles:   (id) => api.get(`/customers/${id}/vehicles`),
  getWorkOrders: (id) => api.get(`/customers/${id}/work-orders`),
};
```

### 8.2 React Query Hook Pattern

Each module has a query hook file:

```typescript
// src/queries/use-customers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { toast } from 'sonner';

export function useCustomers(params) {
  return useQuery({
    queryKey: ['customers', 'list', params],
    queryFn: () => customerService.getAll(params),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', 'detail', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

### 8.3 Endpoint Coverage Matrix

| Module             | Backend Endpoints | Service Functions | Query Hooks     |
| ------------------ | :---------------: | :---------------: | :-------------: |
| Auth               | 4                 | 4                 | 3               |
| Customer           | 5                 | 7                 | 5 (2 sub-lists) |
| Employee           | 5                 | 7                 | 5               |
| Service Catalog    | 9                 | 9                 | 6               |
| Vehicle            | 6                 | 6                 | 5               |
| Supplier           | 6                 | 6                 | 5               |
| Inventory          | 8                 | 8                 | 7               |
| Work Order         | 14                | 14                | 10              |
| Purchase Order     | 8                 | 8                 | 6               |
| Invoice            | 5                 | 5                 | 5               |
| Appointment        | 7                 | 7                 | 6               |
| Payment            | 4                 | 4                 | 4               |
| Expense            | 6                 | 6                 | 5               |
| Service History    | 2                 | 2                 | 2               |
| Dashboard          | 7                 | 7                 | 7               |
| **Total**          | **97**            | **100**           | **81**          |

---

## 9. Form Handling Strategy

### 9.1 Stack

```
Zod (schema) → @hookform/resolvers → React Hook Form (state) → Form Components (UI)
```

### 9.2 Validation Schema Sharing

Frontend Zod schemas **mirror** backend validation schemas but adapted for the UI:

```typescript
// src/lib/validations/customer.ts
import { z } from 'zod';

export const customerFormSchema = z.object({
  firstName:  z.string().min(1, 'First name is required').max(50),
  lastName:   z.string().min(1, 'Last name is required').max(50),
  email:      z.string().email('Invalid email').optional().or(z.literal('')),
  phone:      z.string().min(1, 'Phone is required').max(20),
  address:    z.string().optional(),
  city:       z.string().max(50).optional(),
  postalCode: z.string().max(10).optional(),
  notes:      z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
```

### 9.3 Form Patterns

| Pattern                        | Usage                                                    |
| ------------------------------ | -------------------------------------------------------- |
| **Simple CRUD modal**          | Customer, Employee, Supplier, Expense — single-step form |
| **Multi-step form**            | Work Order create — customer → vehicle → services/parts  |
| **Inline editable table**      | Work order services/parts — add/edit/remove rows         |
| **Searchable select**          | Customer, Vehicle, Mechanic, Part, Supplier selectors    |
| **Date range picker**          | Dashboard filters, report date ranges                    |
| **Enum select**                | Status, Priority, Role, Category dropdowns               |

---

## 10. UI/UX Design System

### 10.1 Color Palette

```
Primary:    Blue (#2563EB → blue-600)     — Actions, links, active states
Success:    Green (#16A34A → green-600)   — Completed, paid, active
Warning:    Amber (#D97706 → amber-600)   — In progress, partial, alerts
Danger:     Red (#DC2626 → red-600)       — Cancelled, overdue, delete
Info:       Sky (#0284C7 → sky-600)       — Informational
Neutral:    Slate (#475569 → slate-600)   — Text, borders, backgrounds

Background: White (#FFFFFF) / Slate-50 (#F8FAFC)
Sidebar:    Slate-900 (#0F172A)
```

### 10.2 Status Color System

| Context       | Status          | Color                                 |
| ------------- | --------------- | ------------------------------------- |
| Work Order    | Pending         | `bg-gray-100 text-gray-700`           |
| Work Order    | In Progress     | `bg-blue-100 text-blue-700`           |
| Work Order    | Completed       | `bg-green-100 text-green-700`         |
| Work Order    | Cancelled       | `bg-red-100 text-red-700`             |
| Invoice       | Unpaid          | `bg-red-100 text-red-700`             |
| Invoice       | Partially Paid  | `bg-amber-100 text-amber-700`         |
| Invoice       | Paid            | `bg-green-100 text-green-700`         |
| Invoice       | Overdue         | `bg-orange-100 text-orange-700`       |
| Appointment   | Scheduled       | `bg-blue-100 text-blue-700`           |
| Appointment   | Confirmed       | `bg-indigo-100 text-indigo-700`       |
| Appointment   | Completed       | `bg-green-100 text-green-700`         |
| Appointment   | Cancelled       | `bg-red-100 text-red-700`             |
| Appointment   | No-Show         | `bg-gray-100 text-gray-700`           |
| Priority      | Low             | `bg-green-100 text-green-700`         |
| Priority      | Medium          | `bg-yellow-100 text-yellow-700`       |
| Priority      | High            | `bg-orange-100 text-orange-700`       |
| Priority      | Urgent          | `bg-red-100 text-red-700`             |

### 10.3 Typography

```
Font:         Inter (or system font stack)
Headings:     font-semibold
  h1:         text-2xl (30px) — Page titles
  h2:         text-xl (24px) — Section titles
  h3:         text-lg (20px) — Card titles
Body:         text-sm (14px) — Default
Small:        text-xs (12px) — Labels, meta
```

### 10.4 Spacing & Layout

```
Page padding:      px-6 py-6
Card padding:      p-6
Table cell:        px-4 py-3
Form field gap:    space-y-4
Section gap:       space-y-6
Grid (dashboard):  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
```

### 10.5 Responsive Breakpoints

| Breakpoint | Width   | Layout Changes                                        |
| ---------- | ------- | ----------------------------------------------------- |
| `sm`       | 640px   | Stack form fields, single column                      |
| `md`       | 768px   | Two-column forms, sidebar collapsible                 |
| `lg`       | 1024px  | Full sidebar visible, 3-4 column dashboard grid       |
| `xl`       | 1280px  | Wider tables, more columns visible                    |

---

## 11. Testing Strategy

### 11.1 Unit Tests

- **Components**: React Testing Library — render, user interactions, conditional display
- **Hooks**: `renderHook` from Testing Library — query hooks, auth hook, debounce
- **Utilities**: Jest — formatCurrency, formatDate, cn, getStatusColor

### 11.2 Integration Tests

- **Forms**: Fill out form → submit → verify API call + toast + cache invalidation
- **Pages**: Render page → verify data loads → interact with table → verify mutations
- **Auth flow**: Login → redirect → verify user state → logout → redirect

### 11.3 E2E Tests (Optional — Playwright)

- Full user journeys: Login → Create customer → Create vehicle → Create work order → Add services → Complete → Generate invoice → Record payment
- Cross-browser testing

### 11.4 Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── ui/button.test.tsx
│   │   └── data/data-table.test.tsx
│   ├── hooks/
│   │   └── use-debounce.test.ts
│   ├── services/
│   │   └── customer.service.test.ts
│   └── utils/
│       └── utils.test.ts
```

---

## 12. Phase-by-Phase Execution Roadmap

### Phase 0 — Foundation (Est. 3–4 days)

| #    | Task                                                                        | Files/Folders                       |
| ---- | --------------------------------------------------------------------------- | ----------------------------------- |
| 0.1  | Initialize Next.js 14 + TypeScript + Tailwind + ESLint                      | Root config files                   |
| 0.2  | Install all dependencies from `frontend-package.json`                       | `package.json`                      |
| 0.3  | Set up path aliases (`@/*` → `src/*`)                                       | `tsconfig.json`                     |
| 0.4  | Configure Tailwind theme (colors, fonts, animation)                         | `tailwind.config.ts`               |
| 0.5  | Build UI primitives: Button, Input, Label, Card, Badge, Dialog, Table, Select, Skeleton, Textarea, Separator | `components/ui/`                    |
| 0.6  | Build layout: Sidebar, Header, Breadcrumbs, PageHeader, MobileNav          | `components/layout/`                |
| 0.7  | Build data components: DataTable, StatCard, StatusBadge, EmptyState, LoadingTable | `components/data/`                  |
| 0.8  | Build form components: FormField, FormSelect, FormDatePicker, SearchInput, ConfirmDialog | `components/forms/`                 |
| 0.9  | Set up API client (Axios instance + interceptors)                           | `lib/api-client.ts`                |
| 0.10 | Set up type definitions (API envelope, all entity types)                    | `types/`                            |
| 0.11 | Set up providers (QueryClient, Auth, Toast)                                 | `providers/`                        |
| 0.12 | Set up auth system (store, middleware, login page, provider)                | `stores/`, `middleware.ts`, `(auth)/` |
| 0.13 | Set up root layout + dashboard layout (sidebar + header)                    | `app/layout.tsx`, `app/(dashboard)/layout.tsx` |
| 0.14 | Set up constants (status labels, colors, role definitions)                  | `lib/constants.ts`                  |
| 0.15 | Set up utility helpers (cn, formatCurrency, formatDate)                     | `lib/utils.ts`                      |

**Deliverable**: Login works, dashboard layout renders with sidebar, empty dashboard page accessible.

---

### Phase 1 — Dashboard + Auth (Est. 2–3 days)

| #    | Task                                                        | Files                             |
| ---- | ----------------------------------------------------------- | --------------------------------- |
| 1.1  | Login page (form, validation, API integration, redirect)    | `(auth)/login/page.tsx`           |
| 1.2  | Dashboard service + query hooks                             | `services/dashboard.service.ts`, `queries/use-dashboard.ts` |
| 1.3  | Chart components (revenue, status pie, bar)                 | `components/charts/`              |
| 1.4  | Dashboard page (KPI cards, charts, alerts)                  | `(dashboard)/page.tsx`            |
| 1.5  | Settings page (change password form)                        | `(dashboard)/settings/page.tsx`   |

**Deliverable**: User can log in and see a live dashboard with real data from the backend.

---

### Phase 2 — Core Entity CRUD (Est. 5–7 days)

| #    | Task                                                                | Files                              |
| ---- | ------------------------------------------------------------------- | ---------------------------------- |
| 2.1  | Customer: service, queries, validation, form, list, detail pages    | `customers/`, related services     |
| 2.2  | Employee: service, queries, validation, form, list, detail pages    | `employees/`, related services     |
| 2.3  | Service Catalog: category + service CRUD (combined page)            | `services/`, related services      |
| 2.4  | Vehicle: service, queries, form, list, detail pages                 | `vehicles/`, related services      |
| 2.5  | Supplier: service, queries, form, list, detail pages                | `suppliers/`, related services     |
| 2.6  | Searchable select components (customer, vehicle, mechanic, supplier)| `components/features/*-select.tsx` |

**Deliverable**: All basic entity CRUD fully functional with search, pagination, sorting.

---

### Phase 3 — Core Business Logic (Est. 5–7 days)

| #    | Task                                                                    | Files                              |
| ---- | ----------------------------------------------------------------------- | ---------------------------------- |
| 3.1  | Inventory: service, queries, parts CRUD, low-stock view, stock adjust   | `inventory/`, related services     |
| 3.2  | Work Order: service, queries, list/detail/create pages                  | `work-orders/`, related services   |
| 3.3  | Work Order: services sub-table (inline add/edit/remove)                 | `work-order-services-table.tsx`    |
| 3.4  | Work Order: parts sub-table (inline add/edit/remove)                    | `work-order-parts-table.tsx`       |
| 3.5  | Work Order: status flow visualization + transition actions              | `work-order-status-flow.tsx`       |
| 3.6  | Appointment: service, queries, list, calendar view, create/edit         | `appointments/`, related services  |
| 3.7  | Appointment: available slots integration + convert-to-WO action         | `appointment-form.tsx`             |

**Deliverable**: Full work order lifecycle and appointment booking functional in the UI.

---

### Phase 4 — Financial Management (Est. 4–5 days)

| #    | Task                                                                | Files                              |
| ---- | ------------------------------------------------------------------- | ---------------------------------- |
| 4.1  | Purchase Order: service, queries, list/detail/create pages          | `purchase-orders/`                 |
| 4.2  | Purchase Order: line items table + receive flow                     | `purchase-order-form.tsx`          |
| 4.3  | Invoice: service, queries, list/detail pages, outstanding view      | `invoices/`                        |
| 4.4  | Invoice: generate from work order action                            | work-order detail page integration |
| 4.5  | Payment: service, queries, list, record payment modal               | `payments/`, `payment-form.tsx`    |
| 4.6  | Expense: service, queries, list, summary, create/edit modal         | `expenses/`, `expense-form.tsx`    |

**Deliverable**: Complete financial flow — purchasing, invoicing, payments, expenses.

---

### Phase 5 — Reports & History (Est. 2–3 days)

| #    | Task                                                        | Files                              |
| ---- | ----------------------------------------------------------- | ---------------------------------- |
| 5.1  | Reports hub page                                            | `reports/page.tsx`                 |
| 5.2  | Revenue analytics page (charts + date range filters)        | `reports/revenue/page.tsx`         |
| 5.3  | Mechanic productivity page                                  | `reports/productivity/page.tsx`    |
| 5.4  | Service history: vehicle detail integration                 | `vehicles/[id]/page.tsx`          |

**Deliverable**: All reporting pages live with interactive charts.

---

### Phase 6 — Polish & UX (Est. 3–4 days)

| #    | Task                                                                |
| ---- | ------------------------------------------------------------------- |
| 6.1  | Mobile responsiveness (all pages tested on 375px+)                  |
| 6.2  | Dark mode support (Tailwind dark variant + theme toggle)            |
| 6.3  | Loading states (all pages have proper skeletons)                    |
| 6.4  | Error boundaries (all pages have error.tsx)                         |
| 6.5  | Empty states (all list pages show helpful empty states)             |
| 6.6  | Keyboard navigation (focus management, tab order)                   |
| 6.7  | Accessibility audit (ARIA labels, screen reader support)            |
| 6.8  | Performance audit (bundle size, lazy loading, image optimization)   |
| 6.9  | Write component tests (critical UI components)                      |
| 6.10 | Cross-browser testing (Chrome, Firefox, Safari, Edge)               |

**Deliverable**: Production-ready, polished frontend.

---

## Total Estimated Timeline

| Phase                              | Duration    | Cumulative    |
| ---------------------------------- | ----------- | ------------- |
| Phase 0 — Foundation               | 3–4 days    | 3–4 days      |
| Phase 1 — Dashboard + Auth         | 2–3 days    | 5–7 days      |
| Phase 2 — Core Entity CRUD         | 5–7 days    | 10–14 days    |
| Phase 3 — Core Business Logic      | 5–7 days    | 15–21 days    |
| Phase 4 — Financial Management     | 4–5 days    | 19–26 days    |
| Phase 5 — Reports & History        | 2–3 days    | 21–29 days    |
| Phase 6 — Polish & UX              | 3–4 days    | 24–33 days    |

> **Total: ~5–7 weeks** for a complete, production-ready frontend.

---

## Summary of Key Architectural Decisions

| Decision             | Choice                                  | Rationale                                                  |
| -------------------- | --------------------------------------- | ---------------------------------------------------------- |
| Framework            | Next.js 14 (App Router)                 | SSR, streaming, layouts, middleware, file-based routing     |
| UI Primitives        | Radix UI + Tailwind + CVA              | Accessibility, no runtime CSS, variant system, owned code  |
| Data Fetching        | React Query (TanStack Query v5)        | Caching, dedup, mutations, optimistic UI, devtools         |
| Global State         | Zustand                                | Minimal, fast, no boilerplate, outside React tree access   |
| Forms                | React Hook Form + Zod                  | Performance (uncontrolled), validation, type inference      |
| Styling              | Tailwind CSS                           | Utility-first, purged in prod, dark mode, responsive       |
| Charts               | Recharts                               | React-native, composable, responsive                       |
| Toast Notifications  | Sonner                                 | Beautiful defaults, stackable, promise-aware                |
| API Client           | Axios                                  | Interceptors, typed responses, automatic JSON              |
| Date Handling        | date-fns                               | Tree-shakeable, immutable, TypeScript support              |
| Icons                | Lucide React                           | Tree-shakeable, consistent, 1000+ icons                    |
| Auth                 | JWT cookie + Zustand + middleware.ts    | Secure (httpOnly), SSR-compatible, fast client checks      |
| URL State            | Next.js searchParams                   | Shareable URLs, browser history, React Query cache keys     |

---

## Backend API Dependency Summary

The frontend consumes **97 endpoints** across **16 modules** from the Express backend at `localhost:4000`:

| Module               | Endpoints | Frontend Pages                     |
| -------------------- | :-------: | ---------------------------------- |
| Auth                 | 4         | Login, Settings                    |
| Customers            | 5         | Customer list, detail              |
| Employees            | 5         | Employee list, detail              |
| Service Categories   | 5         | Service catalog                    |
| Services             | 5         | Service catalog                    |
| Vehicles             | 6         | Vehicle list, detail               |
| Suppliers            | 6         | Supplier list, detail              |
| Parts (Inventory)    | 8         | Inventory, low-stock               |
| Work Orders          | 6+4+4=14  | Work order list, detail, create    |
| Purchase Orders      | 8         | PO list, detail, create            |
| Invoices             | 5         | Invoice list, detail, outstanding  |
| Appointments         | 7         | Appointment calendar, list         |
| Payments             | 4         | Payment list, record modal         |
| Service History      | 2         | Vehicle detail (embedded)          |
| Expenses             | 6         | Expense list, summary              |
| Dashboard            | 7         | Dashboard home, reports            |
