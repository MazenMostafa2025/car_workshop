-- ============================================
-- CAR WORKSHOP DATABASE SCHEMA
-- ============================================

-- Customer Information
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    date_registered DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicle Information
CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    vin VARCHAR(17) UNIQUE,
    license_plate VARCHAR(20) UNIQUE,
    color VARCHAR(30),
    mileage INT,
    engine_type VARCHAR(50),
    transmission_type VARCHAR(30),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- Service Categories
CREATE TABLE service_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Offered
CREATE TABLE services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_duration INT, -- in minutes
    base_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(category_id) ON DELETE SET NULL
);

-- Employees/Mechanics
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL, -- e.g., 'Mechanic', 'Manager', 'Receptionist'
    specialization VARCHAR(100), -- e.g., 'Engine Specialist', 'Electrical'
    hire_date DATE NOT NULL,
    hourly_rate DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Work Orders/Job Cards
CREATE TABLE work_orders (
    work_order_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    customer_id INT NOT NULL,
    assigned_mechanic_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_date DATETIME,
    completion_date DATETIME,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, In Progress, Completed, Cancelled
    priority VARCHAR(20) DEFAULT 'Normal', -- Low, Normal, High, Urgent
    total_labor_cost DECIMAL(10, 2) DEFAULT 0,
    total_parts_cost DECIMAL(10, 2) DEFAULT 0,
    total_cost DECIMAL(10, 2) DEFAULT 0,
    customer_complaint TEXT,
    diagnosis TEXT,
    work_performed TEXT,
    recommendations TEXT,
    mileage_in INT,
    mileage_out INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_mechanic_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Services performed in each work order
CREATE TABLE work_order_services (
    work_order_service_id INT PRIMARY KEY AUTO_INCREMENT,
    work_order_id INT NOT NULL,
    service_id INT NOT NULL,
    mechanic_id INT,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    labor_hours DECIMAL(5, 2),
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, In Progress, Completed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE RESTRICT,
    FOREIGN KEY (mechanic_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Parts Inventory
CREATE TABLE parts (
    part_id INT PRIMARY KEY AUTO_INCREMENT,
    part_number VARCHAR(50) UNIQUE NOT NULL,
    part_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    manufacturer VARCHAR(100),
    quantity_in_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 5,
    unit_cost DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    supplier_id INT,
    location VARCHAR(50), -- Storage location in workshop
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    payment_terms VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key to parts table
ALTER TABLE parts ADD FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL;

-- Parts used in work orders
CREATE TABLE work_order_parts (
    work_order_part_id INT PRIMARY KEY AUTO_INCREMENT,
    work_order_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE RESTRICT
);

-- Purchase Orders for parts
CREATE TABLE purchase_orders (
    purchase_order_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    received_date DATE,
    status VARCHAR(20) DEFAULT 'Ordered', -- Ordered, Received, Cancelled
    total_amount DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT
);

-- Purchase order line items
CREATE TABLE purchase_order_items (
    purchase_order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_ordered INT NOT NULL,
    quantity_received INT DEFAULT 0,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE RESTRICT
);

-- Invoices
CREATE TABLE invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    work_order_id INT NOT NULL,
    customer_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    balance_due DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Unpaid', -- Unpaid, Partially Paid, Paid, Overdue
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

-- Payments
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- Cash, Card, Bank Transfer, Check
    reference_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE RESTRICT
);

-- Appointments/Bookings
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    duration INT DEFAULT 60, -- in minutes
    service_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Scheduled', -- Scheduled, Confirmed, Completed, Cancelled, No-Show
    assigned_mechanic_id INT,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_mechanic_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Service History (for quick vehicle history lookup)
CREATE TABLE service_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    work_order_id INT NOT NULL,
    service_date DATE NOT NULL,
    mileage INT,
    services_performed TEXT,
    parts_replaced TEXT,
    total_cost DECIMAL(10, 2),
    mechanic_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Expenses (for workshop expenses tracking)
CREATE TABLE expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL, -- Rent, Utilities, Tools, Insurance, etc.
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30),
    vendor VARCHAR(100),
    receipt_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_customer_phone ON customers(phone);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_vehicle_license ON vehicles(license_plate);
CREATE INDEX idx_vehicle_vin ON vehicles(vin);
CREATE INDEX idx_vehicle_customer ON vehicles(customer_id);
CREATE INDEX idx_workorder_status ON work_orders(status);
CREATE INDEX idx_workorder_date ON work_orders(order_date);
CREATE INDEX idx_workorder_vehicle ON work_orders(vehicle_id);
CREATE INDEX idx_invoice_status ON invoices(status);
CREATE INDEX idx_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_appointment_status ON appointments(status);
CREATE INDEX idx_parts_number ON parts(part_number);
CREATE INDEX idx_service_history_vehicle ON service_history(vehicle_id);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample service categories
INSERT INTO service_categories (category_name, description) VALUES
('Maintenance', 'Regular maintenance services'),
('Repair', 'Repair services for various car components'),
('Diagnostics', 'Diagnostic and inspection services'),
('Body Work', 'Body and paint services'),
('Electrical', 'Electrical system services');

-- Insert sample services
INSERT INTO services (category_id, service_name, description, estimated_duration, base_price) VALUES
(1, 'Oil Change', 'Standard oil and filter change', 30, 45.00),
(1, 'Tire Rotation', 'Rotate all four tires', 45, 35.00),
(1, 'Brake Inspection', 'Complete brake system inspection', 60, 50.00),
(2, 'Brake Pad Replacement', 'Replace front or rear brake pads', 120, 150.00),
(2, 'Battery Replacement', 'Replace car battery', 30, 120.00),
(3, 'Full Vehicle Inspection', 'Comprehensive vehicle inspection', 90, 80.00),
(3, 'Engine Diagnostic', 'Computer diagnostic scan', 45, 75.00),
(4, 'Minor Dent Repair', 'Repair minor dents and dings', 180, 200.00),
(5, 'Headlight Replacement', 'Replace headlight bulb or assembly', 30, 60.00);

-- Insert sample employees
INSERT INTO employees (first_name, last_name, email, phone, role, specialization, hire_date, hourly_rate) VALUES
('John', 'Smith', 'john.smith@workshop.com', '555-0101', 'Manager', 'General Management', '2020-01-15', 35.00),
('Mike', 'Johnson', 'mike.johnson@workshop.com', '555-0102', 'Mechanic', 'Engine Specialist', '2020-03-20', 28.00),
('Sarah', 'Williams', 'sarah.williams@workshop.com', '555-0103', 'Mechanic', 'Electrical Systems', '2021-06-10', 26.00),
('David', 'Brown', 'david.brown@workshop.com', '555-0104', 'Mechanic', 'Brake & Suspension', '2021-09-05', 25.00),
('Lisa', 'Davis', 'lisa.davis@workshop.com', '555-0105', 'Receptionist', 'Customer Service', '2022-01-12', 18.00);

-- Insert sample suppliers
INSERT INTO suppliers (supplier_name, contact_person, email, phone, payment_terms) VALUES
('AutoParts Direct', 'Tom Anderson', 'tom@autopartsdirect.com', '555-1001', 'Net 30'),
('Quality Parts Inc', 'Jane Roberts', 'jane@qualityparts.com', '555-1002', 'Net 15'),
('Premium Auto Supply', 'Bob Wilson', 'bob@premiumauto.com', '555-1003', 'COD');

-- Insert sample parts
INSERT INTO parts (part_number, part_name, description, category, manufacturer, quantity_in_stock, reorder_level, unit_cost, selling_price, supplier_id, location) VALUES
('OIL-5W30-001', '5W-30 Motor Oil', 'Synthetic 5W-30 motor oil, 5 quart', 'Fluids', 'Mobil1', 24, 10, 22.00, 35.00, 1, 'Shelf A1'),
('FILTER-OIL-001', 'Oil Filter', 'Standard oil filter', 'Filters', 'Fram', 30, 15, 5.00, 12.00, 1, 'Shelf A2'),
('PAD-BRAKE-F001', 'Front Brake Pads', 'Ceramic brake pads - front', 'Brakes', 'Wagner', 12, 5, 35.00, 75.00, 2, 'Shelf B1'),
('BATTERY-STD-001', 'Car Battery', '12V standard car battery', 'Electrical', 'Interstate', 8, 3, 85.00, 145.00, 2, 'Floor Storage 1'),
('BULB-H11-001', 'H11 Headlight Bulb', 'Standard H11 halogen bulb', 'Lighting', 'Sylvania', 20, 8, 12.00, 25.00, 3, 'Shelf C1');
