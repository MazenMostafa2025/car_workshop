-- ============================================
-- COMMON QUERIES FOR CAR WORKSHOP DATABASE
-- ============================================

-- ============================================
-- CUSTOMER & VEHICLE QUERIES
-- ============================================

-- Find all vehicles for a specific customer
SELECT v.*, c.first_name, c.last_name
FROM vehicles v
JOIN customers c ON v.customer_id = c.customer_id
WHERE c.customer_id = 1;

-- Search customer by phone number
SELECT * FROM customers 
WHERE phone LIKE '%555-0101%';

-- Get complete vehicle service history
SELECT 
    sh.service_date,
    sh.mileage,
    sh.services_performed,
    sh.parts_replaced,
    sh.total_cost,
    CONCAT(e.first_name, ' ', e.last_name) as mechanic_name
FROM service_history sh
LEFT JOIN employees e ON sh.mechanic_id = e.employee_id
WHERE sh.vehicle_id = 1
ORDER BY sh.service_date DESC;

-- ============================================
-- WORK ORDER QUERIES
-- ============================================

-- Get all open/pending work orders
SELECT 
    wo.work_order_id,
    wo.order_date,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    CONCAT(v.make, ' ', v.model, ' (', v.year, ')') as vehicle,
    v.license_plate,
    wo.status,
    wo.priority,
    CONCAT(e.first_name, ' ', e.last_name) as mechanic
FROM work_orders wo
JOIN customers c ON wo.customer_id = c.customer_id
JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
LEFT JOIN employees e ON wo.assigned_mechanic_id = e.employee_id
WHERE wo.status IN ('Pending', 'In Progress')
ORDER BY 
    CASE wo.priority 
        WHEN 'Urgent' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Normal' THEN 3 
        WHEN 'Low' THEN 4 
    END,
    wo.order_date;

-- Get detailed work order with all services and parts
SELECT 
    wo.work_order_id,
    wo.order_date,
    CONCAT(c.first_name, ' ', c.last_name) as customer,
    CONCAT(v.make, ' ', v.model) as vehicle,
    wo.customer_complaint,
    wo.diagnosis,
    GROUP_CONCAT(DISTINCT s.service_name SEPARATOR ', ') as services,
    GROUP_CONCAT(DISTINCT CONCAT(p.part_name, ' (', wop.quantity, ')') SEPARATOR ', ') as parts,
    wo.total_labor_cost,
    wo.total_parts_cost,
    wo.total_cost,
    wo.status
FROM work_orders wo
JOIN customers c ON wo.customer_id = c.customer_id
JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
LEFT JOIN work_order_services wos ON wo.work_order_id = wos.work_order_id
LEFT JOIN services s ON wos.service_id = s.service_id
LEFT JOIN work_order_parts wop ON wo.work_order_id = wop.work_order_id
LEFT JOIN parts p ON wop.part_id = p.part_id
WHERE wo.work_order_id = 1
GROUP BY wo.work_order_id;

-- Calculate work order totals
SELECT 
    work_order_id,
    (SELECT COALESCE(SUM(total_price), 0) 
     FROM work_order_services 
     WHERE work_order_id = wo.work_order_id) as labor_total,
    (SELECT COALESCE(SUM(total_price), 0) 
     FROM work_order_parts 
     WHERE work_order_id = wo.work_order_id) as parts_total,
    (SELECT COALESCE(SUM(total_price), 0) 
     FROM work_order_services 
     WHERE work_order_id = wo.work_order_id) +
    (SELECT COALESCE(SUM(total_price), 0) 
     FROM work_order_parts 
     WHERE work_order_id = wo.work_order_id) as grand_total
FROM work_orders wo
WHERE wo.work_order_id = 1;

-- ============================================
-- INVENTORY QUERIES
-- ============================================

-- Parts that need reordering
SELECT 
    p.part_number,
    p.part_name,
    p.quantity_in_stock,
    p.reorder_level,
    s.supplier_name,
    s.contact_person,
    s.phone
FROM parts p
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE p.quantity_in_stock <= p.reorder_level
ORDER BY p.quantity_in_stock;

-- Parts usage report (most used parts)
SELECT 
    p.part_number,
    p.part_name,
    COUNT(wop.work_order_part_id) as times_used,
    SUM(wop.quantity) as total_quantity_used,
    SUM(wop.total_price) as total_revenue,
    SUM(wop.quantity * p.unit_cost) as total_cost,
    SUM(wop.total_price) - SUM(wop.quantity * p.unit_cost) as profit
FROM parts p
JOIN work_order_parts wop ON p.part_id = wop.part_id
WHERE wop.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY p.part_id
ORDER BY total_quantity_used DESC
LIMIT 20;

-- Current inventory value
SELECT 
    SUM(quantity_in_stock * unit_cost) as inventory_cost_value,
    SUM(quantity_in_stock * selling_price) as inventory_retail_value,
    COUNT(*) as total_part_types
FROM parts;

-- ============================================
-- FINANCIAL QUERIES
-- ============================================

-- Daily revenue report
SELECT 
    DATE(i.invoice_date) as date,
    COUNT(i.invoice_id) as total_invoices,
    SUM(i.total_amount) as total_revenue,
    SUM(i.amount_paid) as total_collected,
    SUM(i.balance_due) as total_outstanding
FROM invoices i
WHERE i.invoice_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(i.invoice_date)
ORDER BY date DESC;

-- Outstanding invoices (accounts receivable)
SELECT 
    i.invoice_number,
    i.invoice_date,
    CONCAT(c.first_name, ' ', c.last_name) as customer,
    c.phone,
    i.total_amount,
    i.amount_paid,
    i.balance_due,
    DATEDIFF(CURRENT_DATE, i.invoice_date) as days_outstanding,
    i.status
FROM invoices i
JOIN customers c ON i.customer_id = c.customer_id
WHERE i.status IN ('Unpaid', 'Partially Paid')
ORDER BY i.invoice_date;

-- Monthly revenue by service category
SELECT 
    sc.category_name,
    DATE_FORMAT(wo.order_date, '%Y-%m') as month,
    COUNT(DISTINCT wo.work_order_id) as work_orders,
    SUM(wos.total_price) as revenue
FROM work_order_services wos
JOIN services s ON wos.service_id = s.service_id
JOIN service_categories sc ON s.category_id = sc.category_id
JOIN work_orders wo ON wos.work_order_id = wo.work_order_id
WHERE wo.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
GROUP BY sc.category_id, DATE_FORMAT(wo.order_date, '%Y-%m')
ORDER BY month DESC, revenue DESC;

-- Profit analysis (revenue vs costs)
SELECT 
    DATE_FORMAT(wo.completion_date, '%Y-%m') as month,
    COUNT(wo.work_order_id) as jobs_completed,
    SUM(wo.total_cost) as total_revenue,
    SUM(wo.total_parts_cost) as parts_cost,
    -- Labor cost estimation (hours * mechanic rate)
    SUM(wos.labor_hours * e.hourly_rate) as labor_cost,
    SUM(wo.total_cost) - SUM(wo.total_parts_cost) - SUM(wos.labor_hours * e.hourly_rate) as estimated_profit
FROM work_orders wo
LEFT JOIN work_order_services wos ON wo.work_order_id = wos.work_order_id
LEFT JOIN employees e ON wos.mechanic_id = e.employee_id
WHERE wo.status = 'Completed'
    AND wo.completion_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(wo.completion_date, '%Y-%m')
ORDER BY month DESC;

-- ============================================
-- APPOINTMENT QUERIES
-- ============================================

-- Today's appointments
SELECT 
    a.appointment_date,
    CONCAT(c.first_name, ' ', c.last_name) as customer,
    c.phone,
    CONCAT(v.make, ' ', v.model) as vehicle,
    v.license_plate,
    a.service_type,
    CONCAT(e.first_name, ' ', e.last_name) as mechanic,
    a.status
FROM appointments a
JOIN customers c ON a.customer_id = c.customer_id
JOIN vehicles v ON a.vehicle_id = v.vehicle_id
LEFT JOIN employees e ON a.assigned_mechanic_id = e.employee_id
WHERE DATE(a.appointment_date) = CURRENT_DATE
ORDER BY a.appointment_date;

-- Mechanic schedule for the week
SELECT 
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) as mechanic,
    DATE(a.appointment_date) as date,
    TIME(a.appointment_date) as time,
    CONCAT(c.first_name, ' ', c.last_name) as customer,
    a.service_type,
    a.duration
FROM employees e
LEFT JOIN appointments a ON e.employee_id = a.assigned_mechanic_id
    AND a.appointment_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
    AND a.status != 'Cancelled'
LEFT JOIN customers c ON a.customer_id = c.customer_id
WHERE e.role = 'Mechanic' AND e.is_active = TRUE
ORDER BY e.employee_id, a.appointment_date;

-- ============================================
-- EMPLOYEE/MECHANIC PERFORMANCE
-- ============================================

-- Mechanic productivity report
SELECT 
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) as mechanic,
    COUNT(wo.work_order_id) as jobs_completed,
    SUM(wos.labor_hours) as total_hours,
    AVG(wos.labor_hours) as avg_hours_per_job,
    SUM(wos.total_price) as labor_revenue
FROM employees e
LEFT JOIN work_order_services wos ON e.employee_id = wos.mechanic_id
LEFT JOIN work_orders wo ON wos.work_order_id = wo.work_order_id
WHERE e.role = 'Mechanic'
    AND wo.status = 'Completed'
    AND wo.completion_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY e.employee_id
ORDER BY jobs_completed DESC;

-- ============================================
-- CUSTOMER ANALYTICS
-- ============================================

-- Top customers by revenue
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer,
    c.phone,
    COUNT(DISTINCT wo.work_order_id) as total_visits,
    SUM(wo.total_cost) as total_spent,
    AVG(wo.total_cost) as avg_per_visit,
    MAX(wo.order_date) as last_visit
FROM customers c
JOIN work_orders wo ON c.customer_id = wo.customer_id
WHERE wo.status = 'Completed'
GROUP BY c.customer_id
ORDER BY total_spent DESC
LIMIT 20;

-- Customers who haven't visited recently (potential follow-up)
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer,
    c.phone,
    c.email,
    MAX(wo.order_date) as last_visit,
    DATEDIFF(CURRENT_DATE, MAX(wo.order_date)) as days_since_visit,
    COUNT(wo.work_order_id) as lifetime_visits
FROM customers c
JOIN work_orders wo ON c.customer_id = wo.customer_id
GROUP BY c.customer_id
HAVING days_since_visit > 180  -- More than 6 months
ORDER BY last_visit;

-- ============================================
-- PURCHASE ORDER QUERIES
-- ============================================

-- Open purchase orders
SELECT 
    po.purchase_order_id,
    po.order_date,
    s.supplier_name,
    po.expected_delivery_date,
    po.total_amount,
    po.status,
    COUNT(poi.purchase_order_item_id) as item_count
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.supplier_id
LEFT JOIN purchase_order_items poi ON po.purchase_order_id = poi.purchase_order_id
WHERE po.status = 'Ordered'
GROUP BY po.purchase_order_id
ORDER BY po.expected_delivery_date;

-- ============================================
-- REPORTING QUERIES
-- ============================================

-- Most popular services
SELECT 
    s.service_name,
    sc.category_name,
    COUNT(wos.work_order_service_id) as times_performed,
    AVG(wos.labor_hours) as avg_labor_hours,
    SUM(wos.total_price) as total_revenue
FROM services s
JOIN service_categories sc ON s.category_id = sc.category_id
LEFT JOIN work_order_services wos ON s.service_id = wos.service_id
WHERE wos.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)
GROUP BY s.service_id
ORDER BY times_performed DESC;

-- Vehicle make/model breakdown
SELECT 
    v.make,
    v.model,
    COUNT(DISTINCT v.vehicle_id) as vehicle_count,
    COUNT(wo.work_order_id) as service_count,
    AVG(wo.total_cost) as avg_repair_cost
FROM vehicles v
LEFT JOIN work_orders wo ON v.vehicle_id = wo.vehicle_id
GROUP BY v.make, v.model
ORDER BY service_count DESC;
