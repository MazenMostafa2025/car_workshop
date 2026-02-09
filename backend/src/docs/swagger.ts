import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

// ============================================
// OpenAPI 3.0 Specification
// ============================================

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Car Workshop Management API',
    version: '1.0.0',
    description:
      'RESTful API for managing a car workshop including customers, vehicles, work orders, inventory, invoicing, appointments, and more.',
    contact: { name: 'Workshop Admin' },
    license: { name: 'MIT' },
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  tags: [
    { name: 'Auth', description: 'Authentication & authorization' },
    { name: 'Customers', description: 'Customer management' },
    { name: 'Employees', description: 'Employee management' },
    { name: 'Service Categories', description: 'Service category catalog' },
    { name: 'Services', description: 'Service catalog' },
    { name: 'Vehicles', description: 'Vehicle management' },
    { name: 'Suppliers', description: 'Supplier management' },
    { name: 'Parts (Inventory)', description: 'Parts inventory management' },
    { name: 'Work Orders', description: 'Work order lifecycle' },
    { name: 'Work Order Services', description: 'Services within a work order' },
    { name: 'Work Order Parts', description: 'Parts within a work order' },
    { name: 'Purchase Orders', description: 'Supplier purchase orders' },
    { name: 'Invoices', description: 'Invoice management' },
    { name: 'Appointments', description: 'Appointment scheduling' },
    { name: 'Payments', description: 'Payment processing' },
    { name: 'Service History', description: 'Vehicle service history (read-only)' },
    { name: 'Expenses', description: 'Business expense tracking' },
    { name: 'Dashboard', description: 'Dashboard analytics (Admin/Manager)' },
  ],

  // ── Security Schemes ────────────────────────────────────
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT token obtained from POST /auth/login',
      },
    },

    // ── Reusable Parameters ─────────────────────────────────
    parameters: {
      idParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
        description: 'Resource ID',
      },
      pageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number',
      },
      limitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        description: 'Items per page',
      },
      sortOrderParam: {
        name: 'sortOrder',
        in: 'query',
        schema: { type: 'string', enum: ['asc', 'desc'] },
        description: 'Sort direction',
      },
    },

    // ── Reusable Schemas ────────────────────────────────────
    schemas: {
      // ── Envelope ──────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'array', items: { type: 'object' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalCount: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNextPage: { type: 'boolean' },
              hasPrevPage: { type: 'boolean' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },

      // ── Enums ─────────────────────────────────────────────
      UserRole: { type: 'string', enum: ['ADMIN', 'MANAGER', 'MECHANIC', 'RECEPTIONIST'] },
      WorkOrderStatus: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      },
      WorkOrderPriority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
      WorkOrderServiceStatus: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
      PurchaseOrderStatus: { type: 'string', enum: ['ORDERED', 'RECEIVED', 'CANCELLED'] },
      InvoiceStatus: { type: 'string', enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'] },
      PaymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK'] },
      AppointmentStatus: {
        type: 'string',
        enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      },
      ExpenseCategory: {
        type: 'string',
        enum: [
          'RENT',
          'UTILITIES',
          'SALARIES',
          'PARTS_PURCHASE',
          'EQUIPMENT',
          'MARKETING',
          'INSURANCE',
          'MAINTENANCE',
          'OTHER',
        ],
      },

      // ── Auth ──────────────────────────────────────────────
      RegisterBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', maxLength: 100 },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            description: 'Must have uppercase, lowercase, and digit',
          },
          role: { $ref: '#/components/schemas/UserRole' },
          employeeId: { type: 'integer', minimum: 1 },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
      ChangePasswordBody: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', minLength: 1 },
          newPassword: { type: 'string', minLength: 8, maxLength: 128 },
        },
      },
      AuthToken: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              role: { $ref: '#/components/schemas/UserRole' },
            },
          },
        },
      },

      // ── Customer ──────────────────────────────────────────
      CreateCustomerBody: {
        type: 'object',
        required: ['firstName', 'lastName', 'phone'],
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 50 },
          lastName: { type: 'string', minLength: 1, maxLength: 50 },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
          phone: { type: 'string', minLength: 1, maxLength: 20 },
          address: { type: 'string', maxLength: 500, nullable: true },
          city: { type: 'string', maxLength: 50, nullable: true },
          postalCode: { type: 'string', maxLength: 10, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      UpdateCustomerBody: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 50 },
          lastName: { type: 'string', minLength: 1, maxLength: 50 },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
          phone: { type: 'string', minLength: 1, maxLength: 20 },
          address: { type: 'string', maxLength: 500, nullable: true },
          city: { type: 'string', maxLength: 50, nullable: true },
          postalCode: { type: 'string', maxLength: 10, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string' },
          address: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          postalCode: { type: 'string', nullable: true },
          dateRegistered: { type: 'string', format: 'date' },
          notes: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Employee ──────────────────────────────────────────
      CreateEmployeeBody: {
        type: 'object',
        required: ['firstName', 'lastName', 'role', 'hireDate'],
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 50 },
          lastName: { type: 'string', minLength: 1, maxLength: 50 },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
          phone: { type: 'string', maxLength: 20, nullable: true },
          role: { type: 'string', minLength: 1, maxLength: 50 },
          specialization: { type: 'string', maxLength: 100, nullable: true },
          hireDate: {
            type: 'string',
            format: 'date',
            description: 'ISO date string, coerced to Date',
          },
          hourlyRate: { type: 'number', minimum: 0, exclusiveMinimum: true, nullable: true },
        },
      },
      UpdateEmployeeBody: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 50 },
          lastName: { type: 'string', minLength: 1, maxLength: 50 },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
          phone: { type: 'string', maxLength: 20, nullable: true },
          role: { type: 'string', minLength: 1, maxLength: 50 },
          specialization: { type: 'string', maxLength: 100, nullable: true },
          hireDate: { type: 'string', format: 'date' },
          hourlyRate: { type: 'number', minimum: 0, exclusiveMinimum: true, nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          role: { type: 'string' },
          specialization: { type: 'string', nullable: true },
          hireDate: { type: 'string', format: 'date' },
          hourlyRate: { type: 'number', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Service Category ──────────────────────────────────
      CreateCategoryBody: {
        type: 'object',
        required: ['categoryName'],
        properties: {
          categoryName: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      UpdateCategoryBody: {
        type: 'object',
        properties: {
          categoryName: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      ServiceCategory: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          categoryName: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Service ───────────────────────────────────────────
      CreateServiceBody: {
        type: 'object',
        required: ['serviceName', 'basePrice'],
        properties: {
          categoryId: { type: 'integer', minimum: 1, nullable: true },
          serviceName: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500, nullable: true },
          estimatedDuration: {
            type: 'integer',
            minimum: 1,
            nullable: true,
            description: 'Duration in minutes',
          },
          basePrice: { type: 'number', exclusiveMinimum: true, minimum: 0 },
        },
      },
      UpdateServiceBody: {
        type: 'object',
        properties: {
          categoryId: { type: 'integer', minimum: 1, nullable: true },
          serviceName: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500, nullable: true },
          estimatedDuration: { type: 'integer', minimum: 1, nullable: true },
          basePrice: { type: 'number', exclusiveMinimum: true, minimum: 0 },
          isActive: { type: 'boolean' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          categoryId: { type: 'integer', nullable: true },
          serviceName: { type: 'string' },
          description: { type: 'string', nullable: true },
          estimatedDuration: { type: 'integer', nullable: true },
          basePrice: { type: 'number' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Vehicle ───────────────────────────────────────────
      CreateVehicleBody: {
        type: 'object',
        required: ['customerId', 'make', 'model', 'year'],
        properties: {
          customerId: { type: 'integer', minimum: 1 },
          make: { type: 'string', minLength: 1, maxLength: 50 },
          model: { type: 'string', minLength: 1, maxLength: 50 },
          year: { type: 'integer', minimum: 1900 },
          vin: { type: 'string', minLength: 17, maxLength: 17, nullable: true },
          licensePlate: { type: 'string', maxLength: 20, nullable: true },
          color: { type: 'string', maxLength: 30, nullable: true },
          mileage: { type: 'integer', minimum: 0, nullable: true },
          engineType: { type: 'string', maxLength: 50, nullable: true },
          transmissionType: { type: 'string', maxLength: 30, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      UpdateVehicleBody: {
        type: 'object',
        properties: {
          make: { type: 'string', minLength: 1, maxLength: 50 },
          model: { type: 'string', minLength: 1, maxLength: 50 },
          year: { type: 'integer', minimum: 1900 },
          vin: { type: 'string', minLength: 17, maxLength: 17, nullable: true },
          licensePlate: { type: 'string', maxLength: 20, nullable: true },
          color: { type: 'string', maxLength: 30, nullable: true },
          mileage: { type: 'integer', minimum: 0, nullable: true },
          engineType: { type: 'string', maxLength: 50, nullable: true },
          transmissionType: { type: 'string', maxLength: 30, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          customerId: { type: 'integer' },
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          vin: { type: 'string', nullable: true },
          licensePlate: { type: 'string', nullable: true },
          color: { type: 'string', nullable: true },
          mileage: { type: 'integer', nullable: true },
          engineType: { type: 'string', nullable: true },
          transmissionType: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Supplier ──────────────────────────────────────────
      CreateSupplierBody: {
        type: 'object',
        required: ['supplierName'],
        properties: {
          supplierName: { type: 'string', minLength: 1, maxLength: 100 },
          contactPerson: { type: 'string', maxLength: 100, nullable: true },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
          phone: { type: 'string', maxLength: 20, nullable: true },
          address: { type: 'string', maxLength: 500, nullable: true },
          city: { type: 'string', maxLength: 50, nullable: true },
          postalCode: { type: 'string', maxLength: 10, nullable: true },
          paymentTerms: { type: 'string', maxLength: 100, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      UpdateSupplierBody: {
        type: 'object',
        properties: {
          supplierName: { type: 'string', minLength: 1, maxLength: 100 },
          contactPerson: { type: 'string', maxLength: 100, nullable: true },
          email: { type: 'string', format: 'email', maxLength: 100, nullable: true },
          phone: { type: 'string', maxLength: 20, nullable: true },
          address: { type: 'string', maxLength: 500, nullable: true },
          city: { type: 'string', maxLength: 50, nullable: true },
          postalCode: { type: 'string', maxLength: 10, nullable: true },
          paymentTerms: { type: 'string', maxLength: 100, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      Supplier: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          supplierName: { type: 'string' },
          contactPerson: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          postalCode: { type: 'string', nullable: true },
          paymentTerms: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Part (Inventory) ──────────────────────────────────
      CreatePartBody: {
        type: 'object',
        required: ['partNumber', 'partName', 'unitCost', 'sellingPrice'],
        properties: {
          partNumber: { type: 'string', minLength: 1, maxLength: 50 },
          partName: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 1000, nullable: true },
          category: { type: 'string', maxLength: 50, nullable: true },
          manufacturer: { type: 'string', maxLength: 100, nullable: true },
          quantityInStock: { type: 'integer', minimum: 0, default: 0 },
          reorderLevel: { type: 'integer', minimum: 0, default: 5 },
          unitCost: { type: 'number', minimum: 0 },
          sellingPrice: { type: 'number', minimum: 0 },
          supplierId: { type: 'integer', minimum: 1, nullable: true },
          location: { type: 'string', maxLength: 50, nullable: true },
        },
      },
      UpdatePartBody: {
        type: 'object',
        properties: {
          partName: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 1000, nullable: true },
          category: { type: 'string', maxLength: 50, nullable: true },
          manufacturer: { type: 'string', maxLength: 100, nullable: true },
          quantityInStock: { type: 'integer', minimum: 0 },
          reorderLevel: { type: 'integer', minimum: 0 },
          unitCost: { type: 'number', minimum: 0 },
          sellingPrice: { type: 'number', minimum: 0 },
          supplierId: { type: 'integer', minimum: 1, nullable: true },
          location: { type: 'string', maxLength: 50, nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      AdjustStockBody: {
        type: 'object',
        required: ['adjustment', 'reason'],
        properties: {
          adjustment: {
            type: 'integer',
            description: 'Non-zero integer (positive to add, negative to remove)',
          },
          reason: { type: 'string', minLength: 1, maxLength: 255 },
        },
      },
      Part: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          partNumber: { type: 'string' },
          partName: { type: 'string' },
          description: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          manufacturer: { type: 'string', nullable: true },
          quantityInStock: { type: 'integer' },
          reorderLevel: { type: 'integer' },
          unitCost: { type: 'number' },
          sellingPrice: { type: 'number' },
          supplierId: { type: 'integer', nullable: true },
          location: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Work Order ────────────────────────────────────────
      CreateWorkOrderBody: {
        type: 'object',
        required: ['vehicleId', 'customerId'],
        properties: {
          vehicleId: { type: 'integer', minimum: 1 },
          customerId: { type: 'integer', minimum: 1 },
          assignedMechanicId: { type: 'integer', minimum: 1, nullable: true },
          scheduledDate: { type: 'string', format: 'date-time', nullable: true },
          priority: { $ref: '#/components/schemas/WorkOrderPriority' },
          customerComplaint: { type: 'string', maxLength: 2000, nullable: true },
          diagnosis: { type: 'string', maxLength: 2000, nullable: true },
          mileageIn: { type: 'integer', minimum: 0, nullable: true },
        },
      },
      UpdateWorkOrderBody: {
        type: 'object',
        properties: {
          assignedMechanicId: { type: 'integer', minimum: 1, nullable: true },
          scheduledDate: { type: 'string', format: 'date-time', nullable: true },
          priority: { $ref: '#/components/schemas/WorkOrderPriority' },
          customerComplaint: { type: 'string', maxLength: 2000, nullable: true },
          diagnosis: { type: 'string', maxLength: 2000, nullable: true },
          workPerformed: { type: 'string', maxLength: 2000, nullable: true },
          recommendations: { type: 'string', maxLength: 2000, nullable: true },
          mileageIn: { type: 'integer', minimum: 0, nullable: true },
          mileageOut: { type: 'integer', minimum: 0, nullable: true },
        },
      },
      StatusTransitionBody: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/WorkOrderStatus' },
        },
      },
      WorkOrder: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          vehicleId: { type: 'integer' },
          customerId: { type: 'integer' },
          assignedMechanicId: { type: 'integer', nullable: true },
          orderDate: { type: 'string', format: 'date-time' },
          scheduledDate: { type: 'string', format: 'date-time', nullable: true },
          completionDate: { type: 'string', format: 'date-time', nullable: true },
          status: { $ref: '#/components/schemas/WorkOrderStatus' },
          priority: { $ref: '#/components/schemas/WorkOrderPriority' },
          totalLaborCost: { type: 'number' },
          totalPartsCost: { type: 'number' },
          totalCost: { type: 'number' },
          customerComplaint: { type: 'string', nullable: true },
          diagnosis: { type: 'string', nullable: true },
          workPerformed: { type: 'string', nullable: true },
          recommendations: { type: 'string', nullable: true },
          mileageIn: { type: 'integer', nullable: true },
          mileageOut: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Work Order Service Sub-resource ───────────────────
      AddWorkOrderServiceBody: {
        type: 'object',
        required: ['serviceId', 'unitPrice'],
        properties: {
          serviceId: { type: 'integer', minimum: 1 },
          mechanicId: { type: 'integer', minimum: 1, nullable: true },
          quantity: { type: 'integer', minimum: 1, default: 1 },
          unitPrice: { type: 'number', minimum: 0 },
          laborHours: { type: 'number', minimum: 0, nullable: true },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      UpdateWorkOrderServiceBody: {
        type: 'object',
        properties: {
          mechanicId: { type: 'integer', minimum: 1, nullable: true },
          quantity: { type: 'integer', minimum: 1 },
          unitPrice: { type: 'number', minimum: 0 },
          laborHours: { type: 'number', minimum: 0, nullable: true },
          status: { $ref: '#/components/schemas/WorkOrderServiceStatus' },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      WorkOrderService: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          workOrderId: { type: 'integer' },
          serviceId: { type: 'integer' },
          mechanicId: { type: 'integer', nullable: true },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number' },
          laborHours: { type: 'number', nullable: true },
          totalPrice: { type: 'number' },
          status: { $ref: '#/components/schemas/WorkOrderServiceStatus' },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Work Order Part Sub-resource ──────────────────────
      AddWorkOrderPartBody: {
        type: 'object',
        required: ['partId', 'quantity', 'unitPrice'],
        properties: {
          partId: { type: 'integer', minimum: 1 },
          quantity: { type: 'integer', minimum: 1 },
          unitPrice: { type: 'number', minimum: 0 },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      UpdateWorkOrderPartBody: {
        type: 'object',
        properties: {
          quantity: { type: 'integer', minimum: 1 },
          unitPrice: { type: 'number', minimum: 0 },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      WorkOrderPart: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          workOrderId: { type: 'integer' },
          partId: { type: 'integer' },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number' },
          totalPrice: { type: 'number' },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Purchase Order ────────────────────────────────────
      CreatePurchaseOrderBody: {
        type: 'object',
        required: ['supplierId', 'orderDate', 'items'],
        properties: {
          supplierId: { type: 'integer', minimum: 1 },
          orderDate: { type: 'string', format: 'date' },
          expectedDeliveryDate: { type: 'string', format: 'date', nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['partId', 'quantityOrdered', 'unitCost'],
              properties: {
                partId: { type: 'integer', minimum: 1 },
                quantityOrdered: { type: 'integer', minimum: 1 },
                unitCost: { type: 'number', minimum: 0 },
              },
            },
          },
        },
      },
      UpdatePurchaseOrderBody: {
        type: 'object',
        properties: {
          expectedDeliveryDate: { type: 'string', format: 'date', nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      ReceivePurchaseOrderBody: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['itemId', 'quantityReceived'],
              properties: {
                itemId: { type: 'integer', minimum: 1 },
                quantityReceived: { type: 'integer', minimum: 0 },
              },
            },
          },
        },
      },
      AddPOItemBody: {
        type: 'object',
        required: ['partId', 'quantityOrdered', 'unitCost'],
        properties: {
          partId: { type: 'integer', minimum: 1 },
          quantityOrdered: { type: 'integer', minimum: 1 },
          unitCost: { type: 'number', minimum: 0 },
        },
      },
      UpdatePOItemBody: {
        type: 'object',
        properties: {
          quantityOrdered: { type: 'integer', minimum: 1 },
          unitCost: { type: 'number', minimum: 0 },
        },
      },
      PurchaseOrder: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          supplierId: { type: 'integer' },
          orderDate: { type: 'string', format: 'date' },
          expectedDeliveryDate: { type: 'string', format: 'date', nullable: true },
          receivedDate: { type: 'string', format: 'date', nullable: true },
          status: { $ref: '#/components/schemas/PurchaseOrderStatus' },
          totalAmount: { type: 'number', nullable: true },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Invoice ───────────────────────────────────────────
      CreateInvoiceBody: {
        type: 'object',
        required: ['workOrderId'],
        properties: {
          workOrderId: { type: 'integer', minimum: 1 },
          taxRate: { type: 'number', minimum: 0, maximum: 100, default: 0 },
          discountAmount: { type: 'number', minimum: 0, default: 0 },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      UpdateInvoiceBody: {
        type: 'object',
        properties: {
          taxAmount: { type: 'number', minimum: 0 },
          discountAmount: { type: 'number', minimum: 0 },
          dueDate: { type: 'string', format: 'date', nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      Invoice: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          workOrderId: { type: 'integer' },
          customerId: { type: 'integer' },
          invoiceNumber: { type: 'string' },
          invoiceDate: { type: 'string', format: 'date' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          subtotal: { type: 'number' },
          taxAmount: { type: 'number' },
          discountAmount: { type: 'number' },
          totalAmount: { type: 'number' },
          amountPaid: { type: 'number' },
          balanceDue: { type: 'number' },
          status: { $ref: '#/components/schemas/InvoiceStatus' },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Appointment ───────────────────────────────────────
      CreateAppointmentBody: {
        type: 'object',
        required: ['customerId', 'vehicleId', 'appointmentDate'],
        properties: {
          customerId: { type: 'integer', minimum: 1 },
          vehicleId: { type: 'integer', minimum: 1 },
          appointmentDate: { type: 'string', format: 'date-time' },
          duration: {
            type: 'integer',
            minimum: 1,
            default: 60,
            description: 'Duration in minutes',
          },
          serviceType: { type: 'string', maxLength: 100, nullable: true },
          assignedMechanicId: { type: 'integer', minimum: 1, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      UpdateAppointmentBody: {
        type: 'object',
        properties: {
          appointmentDate: { type: 'string', format: 'date-time' },
          duration: { type: 'integer', minimum: 1 },
          serviceType: { type: 'string', maxLength: 100, nullable: true },
          assignedMechanicId: { type: 'integer', minimum: 1, nullable: true },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      AppointmentStatusBody: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/AppointmentStatus' },
        },
      },
      ConvertAppointmentBody: {
        type: 'object',
        properties: {
          priority: { $ref: '#/components/schemas/WorkOrderPriority' },
          customerComplaint: { type: 'string', maxLength: 2000, nullable: true },
          mileageIn: { type: 'integer', minimum: 0, nullable: true },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          customerId: { type: 'integer' },
          vehicleId: { type: 'integer' },
          appointmentDate: { type: 'string', format: 'date-time' },
          duration: { type: 'integer' },
          serviceType: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/AppointmentStatus' },
          assignedMechanicId: { type: 'integer', nullable: true },
          notes: { type: 'string', nullable: true },
          reminderSent: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Payment ───────────────────────────────────────────
      CreatePaymentBody: {
        type: 'object',
        required: ['invoiceId', 'paymentDate', 'amount', 'paymentMethod'],
        properties: {
          invoiceId: { type: 'integer', minimum: 1 },
          paymentDate: { type: 'string', format: 'date' },
          amount: { type: 'number', exclusiveMinimum: true, minimum: 0 },
          paymentMethod: { $ref: '#/components/schemas/PaymentMethod' },
          referenceNumber: { type: 'string', maxLength: 50, nullable: true },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          invoiceId: { type: 'integer' },
          paymentDate: { type: 'string', format: 'date' },
          amount: { type: 'number' },
          paymentMethod: { $ref: '#/components/schemas/PaymentMethod' },
          referenceNumber: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Service History ───────────────────────────────────
      ServiceHistory: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          vehicleId: { type: 'integer' },
          workOrderId: { type: 'integer' },
          serviceDate: { type: 'string', format: 'date' },
          mileage: { type: 'integer', nullable: true },
          servicesPerformed: { type: 'string', nullable: true },
          partsReplaced: { type: 'string', nullable: true },
          totalCost: { type: 'number', nullable: true },
          mechanicId: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Expense ───────────────────────────────────────────
      CreateExpenseBody: {
        type: 'object',
        required: ['description', 'category', 'amount', 'expenseDate'],
        properties: {
          description: { type: 'string', minLength: 1, maxLength: 255 },
          category: { $ref: '#/components/schemas/ExpenseCategory' },
          amount: { type: 'number', exclusiveMinimum: true, minimum: 0 },
          expenseDate: { type: 'string', format: 'date' },
          vendor: { type: 'string', maxLength: 100, nullable: true },
          receiptNumber: { type: 'string', maxLength: 50, nullable: true },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      UpdateExpenseBody: {
        type: 'object',
        properties: {
          description: { type: 'string', minLength: 1, maxLength: 255 },
          category: { $ref: '#/components/schemas/ExpenseCategory' },
          amount: { type: 'number', exclusiveMinimum: true, minimum: 0 },
          expenseDate: { type: 'string', format: 'date' },
          vendor: { type: 'string', maxLength: 100, nullable: true },
          receiptNumber: { type: 'string', maxLength: 50, nullable: true },
          notes: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          expenseDate: { type: 'string', format: 'date' },
          category: { type: 'string' },
          description: { type: 'string', nullable: true },
          amount: { type: 'number' },
          paymentMethod: { type: 'string', nullable: true },
          vendor: { type: 'string', nullable: true },
          receiptNumber: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },

    // ── Reusable Responses ──────────────────────────────────
    responses: {
      BadRequest: {
        description: 'Validation error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Unauthorized: {
        description: 'Missing or invalid token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },

  security: [{ bearerAuth: [] }],

  // ════════════════════════════════════════════════════════
  // PATHS
  // ════════════════════════════════════════════════════════
  paths: {
    // ── Auth ──────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
          },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: {
            description: 'Email already exists',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive JWT',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: {
          200: {
            description: 'JWT token returned',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthToken' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/change-password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change current user password',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordBody' } },
          },
        },
        responses: {
          200: {
            description: 'Password changed',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Customers ─────────────────────────────────────────
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'List customers',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['firstName', 'lastName', 'dateRegistered', 'createdAt'],
            },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated customer list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Customers'],
        summary: 'Create a customer',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateCustomerBody' } },
          },
        },
        responses: {
          201: {
            description: 'Customer created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Get customer by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: {
            description: 'Customer detail',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Customers'],
        summary: 'Update customer',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateCustomerBody' } },
          },
        },
        responses: {
          200: {
            description: 'Customer updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Customers'],
        summary: 'Delete customer (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Customer deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Employees ─────────────────────────────────────────
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List employees',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['firstName', 'lastName', 'hireDate', 'role', 'createdAt'],
            },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated employee list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Employees'],
        summary: 'Create an employee (Admin/Manager)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateEmployeeBody' } },
          },
        },
        responses: {
          201: {
            description: 'Employee created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: {
            description: 'Employee detail',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Employees'],
        summary: 'Update employee (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateEmployeeBody' } },
          },
        },
        responses: {
          200: { description: 'Employee updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Delete employee (Admin only)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Employee deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Service Categories ────────────────────────────────
    '/service-categories': {
      get: {
        tags: ['Service Categories'],
        summary: 'List service categories',
        responses: {
          200: {
            description: 'Category list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Service Categories'],
        summary: 'Create service category',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryBody' } },
          },
        },
        responses: {
          201: { description: 'Category created' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/service-categories/{id}': {
      get: {
        tags: ['Service Categories'],
        summary: 'Get service category by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Category detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Service Categories'],
        summary: 'Update service category',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateCategoryBody' } },
          },
        },
        responses: {
          200: { description: 'Category updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Service Categories'],
        summary: 'Delete service category',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Category deleted' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Services ──────────────────────────────────────────
    '/services': {
      get: {
        tags: ['Services'],
        summary: 'List services',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['serviceName', 'basePrice', 'createdAt'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated service list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Services'],
        summary: 'Create a service',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateServiceBody' } },
          },
        },
        responses: {
          201: { description: 'Service created' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/services/{id}': {
      get: {
        tags: ['Services'],
        summary: 'Get service by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Service detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Services'],
        summary: 'Update service',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateServiceBody' } },
          },
        },
        responses: {
          200: { description: 'Service updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Services'],
        summary: 'Delete service',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Service deleted' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Vehicles ──────────────────────────────────────────
    '/vehicles': {
      get: {
        tags: ['Vehicles'],
        summary: 'List vehicles',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'customerId', in: 'query', schema: { type: 'integer' } },
          { name: 'make', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['make', 'model', 'year', 'createdAt'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated vehicle list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Vehicles'],
        summary: 'Create a vehicle',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateVehicleBody' } },
          },
        },
        responses: {
          201: { description: 'Vehicle created' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/vehicles/{id}': {
      get: {
        tags: ['Vehicles'],
        summary: 'Get vehicle by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Vehicle detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Vehicles'],
        summary: 'Update vehicle',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateVehicleBody' } },
          },
        },
        responses: {
          200: { description: 'Vehicle updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Vehicles'],
        summary: 'Delete vehicle (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Vehicle deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/vehicles/{id}/service-history': {
      get: {
        tags: ['Vehicles'],
        summary: 'Get service history for a vehicle',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: { 200: { description: 'Vehicle service history' } },
      },
    },

    // ── Suppliers ─────────────────────────────────────────
    '/suppliers': {
      get: {
        tags: ['Suppliers'],
        summary: 'List suppliers',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['supplierName', 'city', 'createdAt'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated supplier list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Suppliers'],
        summary: 'Create supplier (Admin/Manager)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateSupplierBody' } },
          },
        },
        responses: {
          201: { description: 'Supplier created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/suppliers/{id}': {
      get: {
        tags: ['Suppliers'],
        summary: 'Get supplier by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Supplier detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Suppliers'],
        summary: 'Update supplier (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateSupplierBody' } },
          },
        },
        responses: {
          200: { description: 'Supplier updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Suppliers'],
        summary: 'Delete supplier (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Supplier deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/suppliers/{id}/parts': {
      get: {
        tags: ['Suppliers'],
        summary: 'Get parts from a supplier',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: { 200: { description: 'Parts for supplier' } },
      },
    },

    // ── Parts (Inventory) ─────────────────────────────────
    '/parts': {
      get: {
        tags: ['Parts (Inventory)'],
        summary: 'List parts',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'supplierId', in: 'query', schema: { type: 'integer' } },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'lowStock', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['partName', 'partNumber', 'quantityInStock', 'sellingPrice', 'createdAt'],
            },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated parts list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Parts (Inventory)'],
        summary: 'Create a part (Admin/Manager)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreatePartBody' } },
          },
        },
        responses: {
          201: { description: 'Part created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/parts/low-stock': {
      get: {
        tags: ['Parts (Inventory)'],
        summary: 'Get parts below reorder level',
        responses: { 200: { description: 'Low stock parts list' } },
      },
    },
    '/parts/inventory-value': {
      get: {
        tags: ['Parts (Inventory)'],
        summary: 'Get total inventory value',
        responses: { 200: { description: 'Inventory value summary' } },
      },
    },
    '/parts/{id}': {
      get: {
        tags: ['Parts (Inventory)'],
        summary: 'Get part by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Part detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Parts (Inventory)'],
        summary: 'Update part (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdatePartBody' } },
          },
        },
        responses: {
          200: { description: 'Part updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Parts (Inventory)'],
        summary: 'Delete part (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Part deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/parts/{id}/adjust-stock': {
      patch: {
        tags: ['Parts (Inventory)'],
        summary: 'Adjust part stock (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AdjustStockBody' } },
          },
        },
        responses: {
          200: { description: 'Stock adjusted' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ── Work Orders ───────────────────────────────────────
    '/work-orders': {
      get: {
        tags: ['Work Orders'],
        summary: 'List work orders',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/WorkOrderStatus' } },
          {
            name: 'priority',
            in: 'query',
            schema: { $ref: '#/components/schemas/WorkOrderPriority' },
          },
          { name: 'customerId', in: 'query', schema: { type: 'integer' } },
          { name: 'vehicleId', in: 'query', schema: { type: 'integer' } },
          { name: 'mechanicId', in: 'query', schema: { type: 'integer' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['orderDate', 'scheduledDate', 'status', 'priority', 'totalCost', 'createdAt'],
            },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated work order list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Work Orders'],
        summary: 'Create a work order',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateWorkOrderBody' } },
          },
        },
        responses: {
          201: { description: 'Work order created' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/work-orders/{id}': {
      get: {
        tags: ['Work Orders'],
        summary: 'Get work order by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Work order detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Work Orders'],
        summary: 'Update work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateWorkOrderBody' } },
          },
        },
        responses: {
          200: { description: 'Work order updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Work Orders'],
        summary: 'Delete work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Work order deleted' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/work-orders/{id}/status': {
      patch: {
        tags: ['Work Orders'],
        summary: 'Transition work order status',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/StatusTransitionBody' } },
          },
        },
        responses: {
          200: { description: 'Status updated' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },

    // ── Work Order Services (sub-resource) ────────────────
    '/work-orders/{id}/services': {
      get: {
        tags: ['Work Order Services'],
        summary: 'List services on a work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: { 200: { description: 'Work order services' } },
      },
      post: {
        tags: ['Work Order Services'],
        summary: 'Add service to work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddWorkOrderServiceBody' },
            },
          },
        },
        responses: {
          201: { description: 'Service added' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/work-orders/{id}/services/{serviceId}': {
      patch: {
        tags: ['Work Order Services'],
        summary: 'Update a service on a work order',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          {
            name: 'serviceId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWorkOrderServiceBody' },
            },
          },
        },
        responses: {
          200: { description: 'Service updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Work Order Services'],
        summary: 'Remove a service from a work order',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          {
            name: 'serviceId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          200: { description: 'Service removed' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Work Order Parts (sub-resource) ───────────────────
    '/work-orders/{id}/parts': {
      get: {
        tags: ['Work Order Parts'],
        summary: 'List parts on a work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: { 200: { description: 'Work order parts' } },
      },
      post: {
        tags: ['Work Order Parts'],
        summary: 'Add part to work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AddWorkOrderPartBody' } },
          },
        },
        responses: {
          201: { description: 'Part added' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/work-orders/{id}/parts/{partId}': {
      patch: {
        tags: ['Work Order Parts'],
        summary: 'Update a part on a work order',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { name: 'partId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWorkOrderPartBody' },
            },
          },
        },
        responses: {
          200: { description: 'Part updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Work Order Parts'],
        summary: 'Remove a part from a work order',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { name: 'partId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Part removed' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Purchase Orders ───────────────────────────────────
    '/purchase-orders': {
      get: {
        tags: ['Purchase Orders'],
        summary: 'List purchase orders',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          {
            name: 'status',
            in: 'query',
            schema: { $ref: '#/components/schemas/PurchaseOrderStatus' },
          },
          { name: 'supplierId', in: 'query', schema: { type: 'integer' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['orderDate', 'expectedDeliveryDate', 'totalAmount', 'createdAt'],
            },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated purchase order list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Purchase Orders'],
        summary: 'Create purchase order with items (Admin/Manager)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePurchaseOrderBody' },
            },
          },
        },
        responses: {
          201: { description: 'Purchase order created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/purchase-orders/{id}': {
      get: {
        tags: ['Purchase Orders'],
        summary: 'Get purchase order by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Purchase order detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Purchase Orders'],
        summary: 'Update purchase order (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePurchaseOrderBody' },
            },
          },
        },
        responses: {
          200: { description: 'Purchase order updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/purchase-orders/{id}/receive': {
      patch: {
        tags: ['Purchase Orders'],
        summary: 'Receive purchase order (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReceivePurchaseOrderBody' },
            },
          },
        },
        responses: {
          200: { description: 'Purchase order received' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/purchase-orders/{id}/items': {
      post: {
        tags: ['Purchase Orders'],
        summary: 'Add item to purchase order (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AddPOItemBody' } },
          },
        },
        responses: {
          201: { description: 'Item added' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/purchase-orders/{id}/items/{itemId}': {
      patch: {
        tags: ['Purchase Orders'],
        summary: 'Update PO item (Admin/Manager)',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdatePOItemBody' } },
          },
        },
        responses: {
          200: { description: 'Item updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Purchase Orders'],
        summary: 'Remove PO item (Admin/Manager)',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Item removed' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Invoices ──────────────────────────────────────────
    '/invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'List invoices',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/InvoiceStatus' } },
          { name: 'customerId', in: 'query', schema: { type: 'integer' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['invoiceDate', 'totalAmount', 'balanceDue', 'status', 'createdAt'],
            },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated invoice list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Invoices'],
        summary: 'Create invoice from work order (Admin/Manager)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateInvoiceBody' } },
          },
        },
        responses: {
          201: { description: 'Invoice created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/invoices/outstanding': {
      get: {
        tags: ['Invoices'],
        summary: 'Get outstanding invoices',
        responses: { 200: { description: 'Outstanding invoices list' } },
      },
    },
    '/invoices/{id}': {
      get: {
        tags: ['Invoices'],
        summary: 'Get invoice by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Invoice detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Invoices'],
        summary: 'Update invoice (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateInvoiceBody' } },
          },
        },
        responses: {
          200: { description: 'Invoice updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Appointments ──────────────────────────────────────
    '/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List appointments',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          {
            name: 'status',
            in: 'query',
            schema: { $ref: '#/components/schemas/AppointmentStatus' },
          },
          { name: 'customerId', in: 'query', schema: { type: 'integer' } },
          { name: 'mechanicId', in: 'query', schema: { type: 'integer' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['appointmentDate', 'status', 'createdAt'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated appointment list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Create an appointment',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateAppointmentBody' } },
          },
        },
        responses: {
          201: { description: 'Appointment created' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/appointments/available-slots': {
      get: {
        tags: ['Appointments'],
        summary: 'Get available appointment slots',
        parameters: [
          { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'mechanicId', in: 'query', schema: { type: 'integer' } },
          { name: 'duration', in: 'query', schema: { type: 'integer', default: 60 } },
        ],
        responses: { 200: { description: 'Available time slots' } },
      },
    },
    '/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get appointment by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Appointment detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Appointments'],
        summary: 'Update appointment',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateAppointmentBody' } },
          },
        },
        responses: {
          200: { description: 'Appointment updated' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/appointments/{id}/status': {
      patch: {
        tags: ['Appointments'],
        summary: 'Update appointment status',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AppointmentStatusBody' } },
          },
        },
        responses: { 200: { description: 'Status updated' } },
      },
    },
    '/appointments/{id}/convert': {
      post: {
        tags: ['Appointments'],
        summary: 'Convert appointment to work order',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ConvertAppointmentBody' } },
          },
        },
        responses: {
          201: { description: 'Work order created from appointment' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },

    // ── Payments ──────────────────────────────────────────
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'List payments',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'invoiceId', in: 'query', schema: { type: 'integer' } },
          {
            name: 'paymentMethod',
            in: 'query',
            schema: { $ref: '#/components/schemas/PaymentMethod' },
          },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['paymentDate', 'amount', 'createdAt'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated payment list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Payments'],
        summary: 'Record a payment',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentBody' } },
          },
        },
        responses: {
          201: { description: 'Payment recorded' },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Payment detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Payments'],
        summary: 'Delete payment (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Payment deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Service History ───────────────────────────────────
    '/service-history': {
      get: {
        tags: ['Service History'],
        summary: 'List all service history records',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          { name: 'vehicleId', in: 'query', schema: { type: 'integer' } },
          { name: 'customerId', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/WorkOrderStatus' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'completedDate', 'totalAmount'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated service history',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
    },
    '/service-history/vehicle/{vehicleId}': {
      get: {
        tags: ['Service History'],
        summary: 'Get service history for a specific vehicle',
        parameters: [
          {
            name: 'vehicleId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
        ],
        responses: { 200: { description: 'Vehicle service history' } },
      },
    },

    // ── Expenses ──────────────────────────────────────────
    '/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'List expenses',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          {
            name: 'category',
            in: 'query',
            schema: { $ref: '#/components/schemas/ExpenseCategory' },
          },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['expenseDate', 'amount', 'createdAt'] },
          },
          { $ref: '#/components/parameters/sortOrderParam' },
        ],
        responses: {
          200: {
            description: 'Paginated expense list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Create expense (Admin/Manager)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateExpenseBody' } },
          },
        },
        responses: {
          201: { description: 'Expense created' },
          400: { $ref: '#/components/responses/BadRequest' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/expenses/summary': {
      get: {
        tags: ['Expenses'],
        summary: 'Get expense summary by category',
        parameters: [
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Expense summary' } },
      },
    },
    '/expenses/{id}': {
      get: {
        tags: ['Expenses'],
        summary: 'Get expense by ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Expense detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Expenses'],
        summary: 'Update expense (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateExpenseBody' } },
          },
        },
        responses: {
          200: { description: 'Expense updated' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete expense (Admin/Manager)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Expense deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Dashboard ─────────────────────────────────────────
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Overall dashboard summary (Admin/Manager)',
        responses: {
          200: { description: 'Dashboard summary data' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/dashboard/revenue': {
      get: {
        tags: ['Dashboard'],
        summary: 'Revenue data (Admin/Manager)',
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
          },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Revenue data' } },
      },
    },
    '/dashboard/work-orders-by-status': {
      get: {
        tags: ['Dashboard'],
        summary: 'Work orders grouped by status (Admin/Manager)',
        responses: { 200: { description: 'Work orders by status' } },
      },
    },
    '/dashboard/mechanic-productivity': {
      get: {
        tags: ['Dashboard'],
        summary: 'Mechanic productivity metrics (Admin/Manager)',
        parameters: [
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Mechanic productivity data' } },
      },
    },
    '/dashboard/top-services': {
      get: {
        tags: ['Dashboard'],
        summary: 'Top requested services (Admin/Manager)',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }],
        responses: { 200: { description: 'Top services list' } },
      },
    },
    '/dashboard/inventory-alerts': {
      get: {
        tags: ['Dashboard'],
        summary: 'Inventory low-stock alerts (Admin/Manager)',
        responses: { 200: { description: 'Inventory alerts' } },
      },
    },
    '/dashboard/revenue-vs-expenses': {
      get: {
        tags: ['Dashboard'],
        summary: 'Revenue vs expenses comparison (Admin/Manager)',
        parameters: [{ name: 'months', in: 'query', schema: { type: 'integer', default: 6 } }],
        responses: { 200: { description: 'Revenue vs expenses data' } },
      },
    },
  },
};

// ── Router Setup ────────────────────────────────────────────
const swaggerRouter = Router();

swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get(
  '/',
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Car Workshop API Docs',
  }),
);

export { swaggerRouter, swaggerDocument };
