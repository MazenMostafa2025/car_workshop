# Car Workshop Database Schema Documentation

## Overview
This database schema is designed to manage all aspects of a car workshop business, including customer management, vehicle tracking, service scheduling, inventory management, billing, and reporting.

## Core Entities & Their Purpose

### 1. **Customers**
- Stores customer contact information and details
- Links to their vehicles and work orders
- Tracks registration date for customer loyalty programs

### 2. **Vehicles**
- Stores detailed vehicle information
- Each vehicle belongs to one customer (many-to-one relationship)
- Tracks VIN, license plate, make, model, year, and current mileage
- Links to service history

### 3. **Employees**
- Manages workshop staff information
- Tracks mechanics, managers, and support staff
- Stores specializations, hourly rates, and hire dates
- Used for assigning work orders and tracking labor

### 4. **Services & Service Categories**
- **Service Categories**: Groups related services (Maintenance, Repair, etc.)
- **Services**: Individual services offered with pricing and duration
- Base price catalog for consistent pricing

### 5. **Work Orders (Job Cards)**
- Central entity for tracking all repair work
- Links customer, vehicle, and assigned mechanic
- Tracks status (Pending → In Progress → Completed)
- Stores customer complaints, diagnosis, and work performed
- Calculates total costs (labor + parts)

### 6. **Work Order Services**
- Junction table linking work orders to services
- Tracks which services were performed on each work order
- Records labor hours and pricing per service

### 7. **Parts & Inventory**
- Manages parts inventory
- Tracks stock levels and reorder points
- Stores cost and selling price
- Links to suppliers

### 8. **Suppliers**
- Stores supplier contact information
- Tracks payment terms
- Links to parts inventory

### 9. **Work Order Parts**
- Junction table tracking parts used in each work order
- Records quantity and pricing
- Updates inventory when parts are used

### 10. **Purchase Orders**
- Manages parts ordering from suppliers
- Tracks order status and delivery
- Links to purchase order items

### 11. **Invoices**
- Generates billing for completed work orders
- Tracks payment status
- Calculates taxes and discounts
- Monitors outstanding balances

### 12. **Payments**
- Records all payments received
- Links to invoices
- Tracks payment method and reference numbers

### 13. **Appointments**
- Manages customer booking system
- Schedules future service appointments
- Assigns mechanics to appointments
- Tracks appointment status

### 14. **Service History**
- Quick reference for vehicle service history
- Denormalized table for fast lookups
- Shows all services performed on a vehicle

### 15. **Expenses**
- Tracks workshop operating expenses
- Categories for different expense types
- Used for financial reporting and profitability analysis

## Key Relationships

```
CUSTOMERS (1) ──→ (Many) VEHICLES
CUSTOMERS (1) ──→ (Many) WORK_ORDERS
CUSTOMERS (1) ──→ (Many) APPOINTMENTS
CUSTOMERS (1) ──→ (Many) INVOICES

VEHICLES (1) ──→ (Many) WORK_ORDERS
VEHICLES (1) ──→ (Many) APPOINTMENTS
VEHICLES (1) ──→ (Many) SERVICE_HISTORY

WORK_ORDERS (1) ──→ (Many) WORK_ORDER_SERVICES
WORK_ORDERS (1) ──→ (Many) WORK_ORDER_PARTS
WORK_ORDERS (1) ──→ (1) INVOICES

EMPLOYEES (1) ──→ (Many) WORK_ORDERS (as assigned mechanic)
EMPLOYEES (1) ──→ (Many) APPOINTMENTS

SERVICES (Many) ──→ (1) SERVICE_CATEGORIES
SERVICES (Many) ←→ (Many) WORK_ORDERS (through WORK_ORDER_SERVICES)

PARTS (Many) ──→ (1) SUPPLIERS
PARTS (Many) ←→ (Many) WORK_ORDERS (through WORK_ORDER_PARTS)
PARTS (Many) ←→ (Many) PURCHASE_ORDERS (through PURCHASE_ORDER_ITEMS)

INVOICES (1) ──→ (Many) PAYMENTS
```

## Typical Workflows

### 1. **Customer Brings Vehicle for Service**
1. Customer calls or walks in → Create/Find CUSTOMER record
2. Create/Find VEHICLE record
3. Create APPOINTMENT (optional) or WORK_ORDER directly
4. Assign EMPLOYEE (mechanic)
5. Diagnose issue and add to WORK_ORDER
6. Add required SERVICES to WORK_ORDER_SERVICES
7. Add required PARTS to WORK_ORDER_PARTS
8. Update WORK_ORDER status as work progresses
9. Complete work → Update WORK_ORDER to "Completed"
10. Generate INVOICE
11. Record PAYMENT when customer pays
12. Add entry to SERVICE_HISTORY for future reference

### 2. **Inventory Management**
1. Monitor PARTS inventory levels
2. When stock drops below reorder_level → Create PURCHASE_ORDER
3. Add items to PURCHASE_ORDER_ITEMS
4. When parts arrive → Update PURCHASE_ORDER status to "Received"
5. Update PARTS.quantity_in_stock
6. When parts used → Deduct from WORK_ORDER_PARTS creation

### 3. **Appointment Scheduling**
1. Customer requests service → Create APPOINTMENT
2. Check EMPLOYEE availability
3. Assign mechanic and confirm appointment
4. Send reminder (update reminder_sent flag)
5. On appointment day → Convert to WORK_ORDER
6. Update APPOINTMENT status to "Completed"

## Important Business Rules

1. **Cascade Deletes**: 
   - Deleting a customer removes their vehicles, work orders, and appointments
   - Be cautious with deletions; consider soft deletes for production

2. **Inventory Tracking**:
   - Parts quantity should be updated when work_order_parts records are created
   - Consider implementing triggers for automatic inventory updates

3. **Invoice Generation**:
   - Total costs calculated from work_order_services and work_order_parts
   - Tax calculation may vary by location
   - Invoice numbers should be sequential and unique

4. **Status Transitions**:
   - Work Orders: Pending → In Progress → Completed
   - Invoices: Unpaid → Partially Paid → Paid
   - Appointments: Scheduled → Confirmed → Completed/Cancelled

5. **Pricing**:
   - Services have base_price, but actual price can vary per work order
   - Parts have unit_cost (what you pay) and selling_price (what customer pays)

## Reporting Capabilities

With this schema, you can generate reports for:
- Daily/Monthly revenue
- Parts inventory and reorder needs
- Mechanic productivity (work orders completed, hours logged)
- Customer service history
- Outstanding invoices (accounts receivable)
- Most common services/repairs
- Parts usage and profitability
- Customer retention and repeat business
- Average repair time by service type
- Profit margins by service category

## Scalability Considerations

1. **Indexes**: Already included for common queries (status, dates, customer lookups)
2. **Archiving**: Consider archiving old work orders and invoices after 2-3 years
3. **Partitioning**: For large operations, partition work_orders and service_history by date
4. **Caching**: Frequently accessed data (services, parts) can be cached
5. **File Storage**: For documents (invoices, photos), consider separate file storage with references in database

## Extension Possibilities

1. **Document Management**: Add table for storing photos, PDFs of invoices, estimates
2. **Warranty Tracking**: Track parts/service warranties
3. **Customer Communications**: Email/SMS logs
4. **Loyalty Programs**: Points, discounts for repeat customers
5. **Multi-location**: Add branch/location table for multiple workshop locations
6. **Time Tracking**: Detailed time-clock system for employees
7. **Quality Control**: Inspection checklists and quality ratings
8. **Fleet Management**: Special handling for fleet/commercial customers

## Security Considerations

1. Implement user roles and permissions (not included in base schema)
2. Encrypt sensitive customer data (email, phone, address)
3. Maintain audit logs for financial transactions
4. Regular backups with point-in-time recovery
5. Separate read-only reporting database for analytics
