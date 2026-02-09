# 🚗 AutoShop Pro — User Guide

> **Car Workshop Management System**
> Everything you need to manage customers, vehicles, work orders, invoicing, inventory, and more — all in one place.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Logging In](#2-logging-in)
3. [Dashboard](#3-dashboard)
4. [Navigation](#4-navigation)
5. [Customers](#5-customers)
6. [Vehicles](#6-vehicles)
7. [Employees](#7-employees)
8. [Appointments](#8-appointments)
9. [Service Catalog](#9-service-catalog)
10. [Work Orders](#10-work-orders)
11. [Inventory (Parts)](#11-inventory-parts)
12. [Suppliers](#12-suppliers)
13. [Purchase Orders](#13-purchase-orders)
14. [Invoices & Payments](#14-invoices--payments)
15. [Expenses](#15-expenses)
16. [Reports & Analytics](#16-reports--analytics)
17. [Settings](#17-settings)
18. [Keyboard Shortcuts](#18-keyboard-shortcuts)
19. [CSV Export](#19-csv-export)
20. [Printing Invoices](#20-printing-invoices)
21. [Role-Based Access](#21-role-based-access)
22. [Troubleshooting](#22-troubleshooting)

---

## 1. Getting Started

### Prerequisites

| Requirement   | Details                                |
| ------------- | -------------------------------------- |
| Backend       | Node.js 22+, PostgreSQL, port **4000** |
| Frontend      | Node.js 22+, Next.js 14, port **3000** |
| Default Admin | `admin@workshop.com` / `Admin123!`     |

### Starting the Application

```bash
# 1. Start the backend
cd backend
npm run dev          # runs on http://localhost:4000

# 2. Start the frontend
cd frontend
npm run dev          # runs on http://localhost:3000
```

Open your browser to **http://localhost:3000**.

---

## 2. Logging In

| URL | `/login` |
| --- | -------- |

1. Open the app — if you are not logged in you are automatically redirected to the **Login** page.
2. Enter your **Email** and **Password**.
3. Click **Sign in**.
4. On success you land on the **Dashboard**.

> **Tip:** If your session expires, you will be redirected back to login with a message. Simply sign in again.

---

## 3. Dashboard

| URL | `/` (root) |
| --- | ---------- |

The Dashboard gives you an at-a-glance overview of your workshop:

- **Stat Cards** — Total Customers, Active Work Orders, Revenue (month), Pending Invoices.
- **Recent Work Orders** — Quick-view table of the latest jobs with status badges.
- **Quick Actions** — Shortcut buttons to create a Customer, Work Order, or Appointment.

---

## 4. Navigation

### Sidebar

The left sidebar is your primary navigation. It lists all major sections with icons:

| Section         | Icon          | Who Can See                  |
| --------------- | ------------- | ---------------------------- |
| Dashboard       | 📊 LayoutGrid | Everyone                     |
| Customers       | 👥 Users      | Admin, Manager, Receptionist |
| Vehicles        | 🚗 Car        | Admin, Manager, Receptionist |
| Employees       | 🔧 HardHat    | Admin, Manager               |
| Services        | 🛠 Wrench     | Admin, Manager               |
| Work Orders     | 📋 Clipboard  | Everyone                     |
| Appointments    | 📅 Calendar   | Admin, Manager, Receptionist |
| Inventory       | 📦 Package    | Admin, Manager               |
| Suppliers       | 🏭 Factory    | Admin, Manager               |
| Purchase Orders | 🛒 Cart       | Admin, Manager               |
| Invoices        | 📄 FileText   | Admin, Manager, Receptionist |
| Expenses        | 🧾 Receipt    | Admin, Manager               |
| Reports         | 📈 BarChart   | Admin, Manager               |

- **Collapse/Expand:** Click the panel icon (top-left) to collapse the sidebar on desktop, giving more space to the main content area.
- **Mobile:** On small screens, tap the ☰ hamburger menu to open a slide-out navigation drawer.

### Command Palette (Ctrl+K)

Press **Ctrl+K** (or **⌘+K** on Mac) anywhere to open the **Command Palette** — a search-powered dialog that lets you jump to any page instantly.

- Type to filter pages.
- Use **↑ / ↓** arrow keys to navigate, **Enter** to open.
- Press **Esc** to close.

You can also click the **Search…** button in the header bar.

### User Menu

Click your **avatar** (top-right corner) to access:

- **Profile** — view your name and email.
- **Log out** — sign out and return to the login page.

---

## 5. Customers

| URL | `/customers` |
| --- | ------------ |

### List View

- **Search** — type in the search bar to filter customers by name, email, or phone.
- **Pagination** — navigate pages at the bottom; change page size (10, 20, 50, 100).
- **Export** — click the **Export** button to download the current page as CSV.

### Actions

| Action     | How                                                                               |
| ---------- | --------------------------------------------------------------------------------- |
| **Add**    | Click **+ Add Customer** → fill in first/last name, phone, email, address → Save. |
| **View**   | Click a customer name or ⋯ → **View** to see their detail page.                   |
| **Edit**   | Click ⋯ → **Edit** → update fields → Save.                                        |
| **Delete** | Click ⋯ → **Delete** → confirm in the dialog.                                     |

### Customer Detail (`/customers/:id`)

Shows:

- Customer info card (name, email, phone, address).
- **Vehicles** tab — all vehicles registered to this customer.
- **Work Orders** tab — all work orders for this customer.
- **Service History** tab — completed services across all vehicles.

---

## 6. Vehicles

| URL | `/vehicles` |
| --- | ----------- |

### List View

- Search by make, model, VIN, or license plate.
- Each row shows: Make/Model, Year, License Plate, Owner name, VIN.

### Actions

| Action     | How                                                                                   |
| ---------- | ------------------------------------------------------------------------------------- |
| **Add**    | Click **+ Add Vehicle** → select Owner (customer), enter make, model, year, VIN, etc. |
| **View**   | Click a vehicle or ⋯ → **View**.                                                      |
| **Edit**   | ⋯ → **Edit** → update fields.                                                         |
| **Delete** | ⋯ → **Delete** → confirm.                                                             |

### Vehicle Detail (`/vehicles/:id`)

- Vehicle specs (make, model, year, engine, transmission, mileage, color).
- Owner link (click to go to customer page).
- **Work Orders** tab — history of work on this vehicle.
- **Service History** tab — completed services.

---

## 7. Employees

| URL | `/employees` |
| --- | ------------ |

> **Access:** Admin and Manager only.

### List View

- Search by name or email.
- Shows: Name, Role badge, Email, Phone, Hire Date.

### Actions

| Action     | How                                                                                     |
| ---------- | --------------------------------------------------------------------------------------- |
| **Add**    | Click **+ Add Employee** → fill in name, email, role, hire date, hourly rate, password. |
| **View**   | Click name or ⋯ → **View**.                                                             |
| **Edit**   | ⋯ → **Edit** → update fields. Leave password blank to keep existing.                    |
| **Delete** | ⋯ → **Delete** → confirm.                                                               |

### Roles

| Role             | Capabilities                                            |
| ---------------- | ------------------------------------------------------- |
| **Admin**        | Full access to all features.                            |
| **Manager**      | Full access to all features.                            |
| **Mechanic**     | Dashboard, Work Orders.                                 |
| **Receptionist** | Dashboard, Customers, Vehicles, Appointments, Invoices. |

### Employee Detail (`/employees/:id`)

- Employee info card.
- Work order assignments.

---

## 8. Appointments

| URL | `/appointments` |
| --- | --------------- |

### List View

- Search by customer name or service type.
- Shows: Customer, Vehicle, Service Type, Date & Time, Assigned Mechanic, Status badge.

### Actions

| Action     | How                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------- |
| **Add**    | Click **+ Add Appointment** → select customer, vehicle, mechanic, service type, pick date/time. |
| **Edit**   | ⋯ → **Edit**.                                                                                   |
| **Delete** | ⋯ → **Delete** → confirm.                                                                       |

### Statuses

`Scheduled` → `Confirmed` → `In Progress` → `Completed` (or `Cancelled`, `No Show`).

---

## 9. Service Catalog

| URL | `/services` |
| --- | ----------- |

> **Access:** Admin and Manager only.

Manage the list of services your workshop offers.

### Two Sections

1. **Service Categories** — groups like "Engine", "Brakes", "Electrical".
   - Add / Edit / Delete categories.
2. **Services** — individual services within a category.
   - Name, Description, Category, Base Price, Estimated Duration (minutes), Active toggle.

### Actions

| Action            | How                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **Add Category**  | Click **+ Add Category** → enter name & description.                                          |
| **Add Service**   | Click **+ Add Service** → fill in details, select category, set price.                        |
| **Edit**          | Click the edit icon on a row.                                                                 |
| **Delete**        | Click the delete icon → confirm.                                                              |
| **Toggle Active** | Services can be marked active/inactive; inactive services don't show in work order selectors. |

---

## 10. Work Orders

| URL | `/work-orders` |
| --- | -------------- |

Work orders are the core of the workshop — they track every repair job from start to finish.

### List View

- Search by description or customer name.
- Filter by status pills: Pending, In Progress, Completed, Cancelled.
- Shows: ID, Customer, Vehicle, Priority badge, Status badge, Assigned Mechanic, Date.

### Creating a Work Order

1. Click **+ New Work Order**.
2. Select **Customer** → then **Vehicle** (filtered to that customer's vehicles).
3. Set **Priority** (Low / Medium / High / Urgent).
4. Optionally assign a **Mechanic** and set an estimated completion date.
5. Add **Description** and **Diagnosis** notes.
6. Save.

### Work Order Detail (`/work-orders/:id`)

This is the most feature-rich detail page:

- **Header** — status badge, priority badge, quick-action buttons.
- **Details Card** — customer & vehicle links, mechanic, dates.
- **Services Tab** — add/remove services to the work order with quantity and price.
- **Parts Tab** — add/remove parts with quantity and price.
- **Status Updates** — change status (e.g., "Start Work" moves from Pending → In Progress).
- **Generate Invoice** — once status is Completed, click to create an invoice automatically.
- **Totals** — auto-calculated subtotal of all services + parts.

### Workflow

```
Pending  →  In Progress  →  Completed  →  Invoice Generated
                ↓
           Cancelled
```

---

## 11. Inventory (Parts)

| URL | `/inventory` |
| --- | ------------ |

> **Access:** Admin and Manager only.

### List View

- Search parts by name, part number, or category.
- Shows: Part Name, Part Number, Category, Stock Qty, Reorder Level, Unit Cost, Selling Price, Status (Active/Low Stock/Out of Stock).

### Actions

| Action               | How                                                                         |
| -------------------- | --------------------------------------------------------------------------- |
| **Add Part**         | Click **+ Add Part** → name, part number, category, supplier, costs, stock. |
| **Edit Part**        | ⋯ → **Edit**.                                                               |
| **Delete Part**      | ⋯ → **Delete** → confirm.                                                   |
| **Stock Adjustment** | ⋯ → **Adjust Stock** → choose Add/Remove/Set, enter quantity & reason.      |

### Low Stock Alerts

Parts with quantity ≤ reorder level are flagged with an amber "Low Stock" badge. Out-of-stock items show a red "Out of Stock" badge.

---

## 12. Suppliers

| URL | `/suppliers` |
| --- | ------------ |

> **Access:** Admin and Manager only.

### List View

- Search by name, contact person, or city.
- Shows: Name, Contact Person, Email, Phone, City.

### Actions

| Action     | How                                                                      |
| ---------- | ------------------------------------------------------------------------ |
| **Add**    | Click **+ Add Supplier** → fill in name, contact, email, phone, address. |
| **View**   | Click name or ⋯ → **View** for detail page with linked parts & POs.      |
| **Edit**   | ⋯ → **Edit**.                                                            |
| **Delete** | ⋯ → **Delete** → confirm.                                                |

### Supplier Detail (`/suppliers/:id`)

- Supplier info card.
- **Parts** supplied by this vendor.
- **Purchase Orders** placed with this supplier.

---

## 13. Purchase Orders

| URL | `/purchase-orders` |
| --- | ------------------ |

> **Access:** Admin and Manager only.

### List View

- Search by supplier name or PO number.
- Shows: PO Number, Supplier, Status badge, Order Date, Expected Delivery, Total.

### Creating a Purchase Order

1. Click **+ New Purchase Order**.
2. Select **Supplier**.
3. Set **Expected Delivery Date**.
4. Add **Line Items** — select Part, enter quantity and unit cost.
5. Save as **Draft**.

### PO Detail (`/purchase-orders/:id`)

- PO header info (number, supplier, dates, status).
- Line items table with part name, quantity, unit cost, line total.
- **Status Actions:** Draft → Ordered → Received (or Cancelled).
- **Total** auto-calculated from line items.

### Statuses

`Draft` → `Ordered` → `Received` (or `Cancelled` at any point).

---

## 14. Invoices & Payments

| URL | `/invoices` |
| --- | ----------- |

### List View

- Search by invoice number or customer name.
- Filter by status: Unpaid, Partially Paid, Paid, Overdue.
- Shows: Invoice Number, Customer, Total, Paid Amount, Balance, Status badge, Date.

### Creating an Invoice

Invoices are typically created from a **Completed Work Order** by clicking **Generate Invoice** on the work order detail page. You can also create one manually:

1. Click **+ Create Invoice**.
2. Select **Work Order** and **Customer**.
3. Set Tax Amount, Discount, Due Date, Notes.
4. Save — subtotal is auto-calculated from the work order.

### Invoice Detail (`/invoices/:id`)

- **Invoice Details** card — number, status, date, due date, linked work order.
- **Amounts** card — subtotal, tax, discount, total, amount paid, balance due.
- **Payment History** — list of all payments received.
- **Record Payment** — click to add a new payment (amount, method, date, reference).
- **Print** — click the 🖨 **Print** button for a clean, print-optimized invoice.

### Payment Methods

Cash, Credit Card, Debit Card, Bank Transfer, Check, Other.

---

## 15. Expenses

| URL | `/expenses` |
| --- | ----------- |

> **Access:** Admin and Manager only.

Track overhead expenses unrelated to specific work orders.

### List View

- Search by description, vendor, or category.
- Shows: Category, Vendor, Description, Amount, Date, Reference.

### Actions

| Action     | How                                                                                 |
| ---------- | ----------------------------------------------------------------------------------- |
| **Add**    | Click **+ Add Expense** → select category, enter amount, vendor, date, description. |
| **Edit**   | ⋯ → **Edit**.                                                                       |
| **Delete** | ⋯ → **Delete** → confirm.                                                           |

### Categories

Rent, Utilities, Salaries, Equipment, Supplies, Insurance, Marketing, Maintenance, Other.

---

## 16. Reports & Analytics

| URL | `/reports` |
| --- | ---------- |

> **Access:** Admin and Manager only.

The Reports hub links to three specialized analytics pages:

### Revenue Analytics (`/reports/revenue`)

- **Revenue Over Time** — line/bar chart showing monthly revenue.
- **Revenue by Category** — breakdown by service type.
- **Key Metrics** — total revenue, average ticket, growth rate.

### Mechanic Productivity (`/reports/productivity`)

- **Work Orders per Mechanic** — bar chart.
- **Completion Rates** — who finishes on time.
- **Revenue Generated** — per mechanic.

### Top Services (`/reports/top-services`)

- **Most Popular Services** — ranked by volume.
- **Revenue by Service** — which services earn the most.

---

## 17. Settings

| URL | `/settings` |
| --- | ----------- |

### Account Settings

- **Change Password** — enter current password, new password (min 6 chars), confirm new password.
- Passwords must match or validation will prevent submission.

---

## 18. Keyboard Shortcuts

| Shortcut   | Action                   |
| ---------- | ------------------------ |
| **Ctrl+K** | Open Command Palette     |
| **↑ / ↓**  | Navigate palette results |
| **Enter**  | Open selected page       |
| **Esc**    | Close palette / dialogs  |

---

## 19. CSV Export

Data tables throughout the app support CSV export:

1. Navigate to any list page (e.g., Customers, Vehicles, Work Orders).
2. Click the **⬇ Export** button in the table footer (appears when data is present).
3. A `.csv` file downloads automatically to your browser's download folder.

> **Note:** The export includes the currently displayed page of data with human-readable column headers.

---

## 20. Printing Invoices

1. Navigate to an invoice detail page (`/invoices/:id`).
2. Click the 🖨 **Print** button in the header.
3. Your browser's print dialog opens with a clean, print-optimized layout:
   - Sidebar, header, and buttons are hidden.
   - White background, readable fonts.
   - Page-break-safe card layouts.

---

## 21. Role-Based Access

The system enforces role-based access at both the **middleware level** (server-side) and the **UI level** (sidebar filtering):

| Feature                 | Admin | Manager | Mechanic | Receptionist |
| ----------------------- | :---: | :-----: | :------: | :----------: |
| Dashboard               |  ✅   |   ✅    |    ✅    |      ✅      |
| Customers               |  ✅   |   ✅    |    ❌    |      ✅      |
| Vehicles                |  ✅   |   ✅    |    ❌    |      ✅      |
| Employees               |  ✅   |   ✅    |    ❌    |      ❌      |
| Services                |  ✅   |   ✅    |    ❌    |      ❌      |
| Work Orders             |  ✅   |   ✅    |    ✅    |      ✅      |
| Appointments            |  ✅   |   ✅    |    ❌    |      ✅      |
| Inventory               |  ✅   |   ✅    |    ❌    |      ❌      |
| Suppliers               |  ✅   |   ✅    |    ❌    |      ❌      |
| Purchase Orders         |  ✅   |   ✅    |    ❌    |      ❌      |
| Invoices                |  ✅   |   ✅    |    ❌    |      ✅      |
| Expenses                |  ✅   |   ✅    |    ❌    |      ❌      |
| Reports                 |  ✅   |   ✅    |    ❌    |      ❌      |
| Settings (own password) |  ✅   |   ✅    |    ✅    |      ✅      |

### Middleware Protection

The Next.js middleware checks the JWT in the `auth-token` cookie on every request:

- **No token** → redirected to `/login`.
- **Expired token** → redirected to `/login?expired=true`, cookie cleared.
- **Non-admin/manager on restricted routes** (`/invoices`, `/expenses`, `/purchase-orders`, `/reports`) → redirected to `/`.

---

## 22. Troubleshooting

### Can't log in?

- Ensure the **backend is running** on port 4000.
- Check credentials: default admin is `admin@workshop.com` / `Admin123!`.
- If you see "expired" in the URL, your session timed out — just log in again.

### Page shows "Not found" or blank?

- Make sure you are navigating to a valid URL.
- Check if your role has access to that page (see [Role-Based Access](#21-role-based-access)).

### Data not loading?

- Verify the backend API is running (`http://localhost:4000/api/v1/auth/me` should respond).
- Check browser DevTools → Network tab for failed requests.
- If you see 429 errors, the rate limiter is active — wait a moment and retry.

### Forms not submitting?

- Check for red validation errors below each field.
- Required fields are marked with a red asterisk (\*).
- Ensure numeric fields have valid numbers (not text).

### CSV export not working?

- The Export button only appears when the table has data.
- If the download doesn't start, check your browser's download settings / popup blocker.

---

## Quick Reference — Common Workflows

### 1. New Customer → Vehicle → Work Order → Invoice

```
Add Customer → Add Vehicle (select customer) → Create Work Order (select customer & vehicle)
→ Add Services & Parts → Complete Work Order → Generate Invoice → Record Payment
```

### 2. Restock Parts

```
Check Inventory (low stock items) → Create Purchase Order (select supplier, add items)
→ Mark PO as "Ordered" → When delivered, mark as "Received" (stock auto-updates)
```

### 3. Schedule an Appointment

```
Appointments → + Add Appointment → Select Customer → Select Vehicle
→ Choose Service Type → Pick Date & Time → Assign Mechanic → Save
```

### 4. View Financial Summary

```
Reports → Revenue Analytics → View monthly revenue chart and key metrics
Reports → Top Services → See which services generate the most revenue
Expenses → Track overhead costs
```

---

_Document generated for AutoShop Pro v0.1.0. For developer documentation, see [README.md](../README.md), [SCHEMA_DOCUMENTATION.md](../SCHEMA_DOCUMENTATION.md), and [TECH_STACK_GUIDE.md](../TECH_STACK_GUIDE.md)._
