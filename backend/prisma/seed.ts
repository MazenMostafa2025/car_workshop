import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed the database with initial data.
 *
 * Uses sequential upserts so that FK-dependent records
 * (services → categories, vehicles → customers, etc.)
 * are always created in the correct order.
 */
async function main(): Promise<void> {
  console.info('🌱 Seeding database...');

  // ============================================
  // 1. SERVICE CATEGORIES (no FK deps)
  // ============================================

  const categoryData = [
    { id: 1, categoryName: 'Maintenance', description: 'Regular maintenance services' },
    { id: 2, categoryName: 'Repair', description: 'Repair services for various car components' },
    { id: 3, categoryName: 'Diagnostics', description: 'Diagnostic and inspection services' },
    { id: 4, categoryName: 'Body Work', description: 'Body and paint services' },
    { id: 5, categoryName: 'Electrical', description: 'Electrical system services' },
  ];

  for (const cat of categoryData) {
    await prisma.serviceCategory.upsert({ where: { id: cat.id }, update: {}, create: cat });
  }
  console.info(`  ✅ ${categoryData.length} service categories`);

  // ============================================
  // 2. SERVICES (depends on categories)
  // ============================================

  const serviceData = [
    {
      id: 1,
      categoryId: 1,
      serviceName: 'Oil Change',
      description: 'Standard oil and filter change',
      estimatedDuration: 30,
      basePrice: 45.0,
    },
    {
      id: 2,
      categoryId: 1,
      serviceName: 'Tire Rotation',
      description: 'Rotate all four tires',
      estimatedDuration: 45,
      basePrice: 35.0,
    },
    {
      id: 3,
      categoryId: 1,
      serviceName: 'Brake Inspection',
      description: 'Complete brake system inspection',
      estimatedDuration: 60,
      basePrice: 50.0,
    },
    {
      id: 4,
      categoryId: 2,
      serviceName: 'Brake Pad Replacement',
      description: 'Replace front or rear brake pads',
      estimatedDuration: 120,
      basePrice: 150.0,
    },
    {
      id: 5,
      categoryId: 2,
      serviceName: 'Battery Replacement',
      description: 'Replace car battery',
      estimatedDuration: 30,
      basePrice: 120.0,
    },
    {
      id: 6,
      categoryId: 3,
      serviceName: 'Full Vehicle Inspection',
      description: 'Comprehensive vehicle inspection',
      estimatedDuration: 90,
      basePrice: 80.0,
    },
    {
      id: 7,
      categoryId: 3,
      serviceName: 'Engine Diagnostic',
      description: 'Computer diagnostic scan',
      estimatedDuration: 45,
      basePrice: 75.0,
    },
    {
      id: 8,
      categoryId: 4,
      serviceName: 'Minor Dent Repair',
      description: 'Repair minor dents and dings',
      estimatedDuration: 180,
      basePrice: 200.0,
    },
    {
      id: 9,
      categoryId: 5,
      serviceName: 'Headlight Replacement',
      description: 'Replace headlight bulb or assembly',
      estimatedDuration: 30,
      basePrice: 60.0,
    },
  ];

  for (const svc of serviceData) {
    await prisma.service.upsert({ where: { id: svc.id }, update: {}, create: svc });
  }
  console.info(`  ✅ ${serviceData.length} services`);

  // ============================================
  // 3. EMPLOYEES (no FK deps)
  // ============================================

  const employeeData = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@workshop.com',
      phone: '555-0101',
      role: 'Manager',
      specialization: 'General Management',
      hireDate: new Date('2020-01-15'),
      hourlyRate: 35.0,
    },
    {
      id: 2,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@workshop.com',
      phone: '555-0102',
      role: 'Mechanic',
      specialization: 'Engine Specialist',
      hireDate: new Date('2020-03-20'),
      hourlyRate: 28.0,
    },
    {
      id: 3,
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@workshop.com',
      phone: '555-0103',
      role: 'Mechanic',
      specialization: 'Electrical Systems',
      hireDate: new Date('2021-06-10'),
      hourlyRate: 26.0,
    },
    {
      id: 4,
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@workshop.com',
      phone: '555-0104',
      role: 'Mechanic',
      specialization: 'Brake & Suspension',
      hireDate: new Date('2021-09-05'),
      hourlyRate: 25.0,
    },
    {
      id: 5,
      firstName: 'Lisa',
      lastName: 'Davis',
      email: 'lisa.davis@workshop.com',
      phone: '555-0105',
      role: 'Receptionist',
      specialization: 'Customer Service',
      hireDate: new Date('2022-01-12'),
      hourlyRate: 18.0,
    },
  ];

  for (const emp of employeeData) {
    await prisma.employee.upsert({ where: { id: emp.id }, update: {}, create: emp });
  }
  console.info(`  ✅ ${employeeData.length} employees`);

  // ============================================
  // 4. SUPPLIERS (no FK deps)
  // ============================================

  const supplierData = [
    {
      id: 1,
      supplierName: 'AutoParts Direct',
      contactPerson: 'Tom Anderson',
      email: 'tom@autopartsdirect.com',
      phone: '555-1001',
      paymentTerms: 'Net 30',
    },
    {
      id: 2,
      supplierName: 'Quality Parts Inc',
      contactPerson: 'Jane Roberts',
      email: 'jane@qualityparts.com',
      phone: '555-1002',
      paymentTerms: 'Net 15',
    },
    {
      id: 3,
      supplierName: 'Premium Auto Supply',
      contactPerson: 'Bob Wilson',
      email: 'bob@premiumauto.com',
      phone: '555-1003',
      paymentTerms: 'COD',
    },
  ];

  for (const sup of supplierData) {
    await prisma.supplier.upsert({ where: { id: sup.id }, update: {}, create: sup });
  }
  console.info(`  ✅ ${supplierData.length} suppliers`);

  // ============================================
  // 5. PARTS (depends on suppliers)
  // ============================================

  const partData = [
    {
      partNumber: 'OIL-5W30-001',
      partName: '5W-30 Motor Oil',
      description: 'Synthetic 5W-30 motor oil, 5 quart',
      category: 'Fluids',
      manufacturer: 'Mobil1',
      quantityInStock: 24,
      reorderLevel: 10,
      unitCost: 22.0,
      sellingPrice: 35.0,
      supplierId: 1,
      location: 'Shelf A1',
    },
    {
      partNumber: 'FILTER-OIL-001',
      partName: 'Oil Filter',
      description: 'Standard oil filter',
      category: 'Filters',
      manufacturer: 'Fram',
      quantityInStock: 30,
      reorderLevel: 15,
      unitCost: 5.0,
      sellingPrice: 12.0,
      supplierId: 1,
      location: 'Shelf A2',
    },
    {
      partNumber: 'PAD-BRAKE-F001',
      partName: 'Front Brake Pads',
      description: 'Ceramic brake pads - front',
      category: 'Brakes',
      manufacturer: 'Wagner',
      quantityInStock: 12,
      reorderLevel: 5,
      unitCost: 35.0,
      sellingPrice: 75.0,
      supplierId: 2,
      location: 'Shelf B1',
    },
    {
      partNumber: 'BATTERY-STD-001',
      partName: 'Car Battery',
      description: '12V standard car battery',
      category: 'Electrical',
      manufacturer: 'Interstate',
      quantityInStock: 8,
      reorderLevel: 3,
      unitCost: 85.0,
      sellingPrice: 145.0,
      supplierId: 2,
      location: 'Floor Storage 1',
    },
    {
      partNumber: 'BULB-H11-001',
      partName: 'H11 Headlight Bulb',
      description: 'Standard H11 halogen bulb',
      category: 'Lighting',
      manufacturer: 'Sylvania',
      quantityInStock: 20,
      reorderLevel: 8,
      unitCost: 12.0,
      sellingPrice: 25.0,
      supplierId: 3,
      location: 'Shelf C1',
    },
  ];

  for (const part of partData) {
    await prisma.part.upsert({ where: { partNumber: part.partNumber }, update: {}, create: part });
  }
  console.info(`  ✅ ${partData.length} parts`);

  // ============================================
  // 6. USERS (depends on employees)
  // ============================================

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workshop.com' },
    update: {},
    create: {
      email: 'admin@workshop.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      employeeId: 1,
    },
  });
  console.info(`  ✅ Admin user: ${admin.email} (password: Admin123!)`);

  const managerPassword = await bcrypt.hash('Manager123!', 12);
  await prisma.user.upsert({
    where: { email: 'manager@workshop.com' },
    update: {},
    create: {
      email: 'manager@workshop.com',
      passwordHash: managerPassword,
      role: UserRole.MANAGER,
    },
  });

  const mechanicPassword = await bcrypt.hash('Mechanic123!', 12);
  await prisma.user.upsert({
    where: { email: 'mike.johnson@workshop.com' },
    update: {},
    create: {
      email: 'mike.johnson@workshop.com',
      passwordHash: mechanicPassword,
      role: UserRole.MECHANIC,
      employeeId: 2,
    },
  });

  const receptionistPassword = await bcrypt.hash('Reception123!', 12);
  await prisma.user.upsert({
    where: { email: 'lisa.davis@workshop.com' },
    update: {},
    create: {
      email: 'lisa.davis@workshop.com',
      passwordHash: receptionistPassword,
      role: UserRole.RECEPTIONIST,
      employeeId: 5,
    },
  });
  console.info('  ✅ 4 user accounts (admin, manager, mechanic, receptionist)');

  // ============================================
  // 7. SAMPLE CUSTOMERS (no FK deps)
  // ============================================

  const customerData = [
    {
      id: 1,
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@email.com',
      phone: '555-2001',
      address: '456 Oak Street',
      city: 'Springfield',
      postalCode: '62701',
    },
    {
      id: 2,
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      phone: '555-2002',
      address: '789 Pine Avenue',
      city: 'Springfield',
      postalCode: '62702',
    },
    {
      id: 3,
      firstName: 'Robert',
      lastName: 'Chen',
      email: 'robert.chen@email.com',
      phone: '555-2003',
      address: '321 Maple Drive',
      city: 'Springfield',
      postalCode: '62703',
    },
  ];

  for (const cust of customerData) {
    await prisma.customer.upsert({ where: { id: cust.id }, update: {}, create: cust });
  }
  console.info(`  ✅ ${customerData.length} sample customers`);

  // ============================================
  // 8. SAMPLE VEHICLES (depends on customers)
  // ============================================

  const vehicleData = [
    {
      id: 1,
      customerId: 1,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: '1HGBH41JXMN109186',
      licensePlate: 'ABC-1234',
      color: 'Silver',
      mileage: 45000,
      engineType: '2.5L 4-Cylinder',
      transmissionType: 'Automatic',
    },
    {
      id: 2,
      customerId: 1,
      make: 'Honda',
      model: 'CR-V',
      year: 2019,
      vin: '2HGFC2F59KH558490',
      licensePlate: 'DEF-5678',
      color: 'Blue',
      mileage: 62000,
      engineType: '1.5L Turbo',
      transmissionType: 'CVT',
    },
    {
      id: 3,
      customerId: 2,
      make: 'Ford',
      model: 'F-150',
      year: 2021,
      vin: '1FTEW1EP5MFB12345',
      licensePlate: 'GHI-9012',
      color: 'White',
      mileage: 28000,
      engineType: '3.5L V6 EcoBoost',
      transmissionType: 'Automatic',
    },
    {
      id: 4,
      customerId: 3,
      make: 'BMW',
      model: '330i',
      year: 2022,
      vin: 'WBA5R1C05NCK12345',
      licensePlate: 'JKL-3456',
      color: 'Black',
      mileage: 15000,
      engineType: '2.0L Turbo',
      transmissionType: 'Automatic',
    },
  ];

  for (const veh of vehicleData) {
    await prisma.vehicle.upsert({ where: { id: veh.id }, update: {}, create: veh });
  }
  console.info(`  ✅ ${vehicleData.length} sample vehicles`);

  // ============================================
  // RESET AUTO-INCREMENT SEQUENCES
  // ============================================
  // After seeding with explicit IDs, PostgreSQL sequences
  // are still at their default start value, which causes
  // "duplicate key" errors when creating new records.

  const sequences = [
    { table: 'service_categories', column: 'category_id' },
    { table: 'services', column: 'service_id' },
    { table: 'employees', column: 'employee_id' },
    { table: 'suppliers', column: 'supplier_id' },
    { table: 'customers', column: 'customer_id' },
    { table: 'vehicles', column: 'vehicle_id' },
  ];

  for (const { table, column } of sequences) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('${table}', '${column}'), COALESCE((SELECT MAX(${column}) FROM ${table}), 0) + 1, false)`,
    );
  }
  console.info('  ✅ Auto-increment sequences reset');

  console.info('\n🎉 Database seeded successfully!\n');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
