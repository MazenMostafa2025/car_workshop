import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@config/index';
import { requestLogger } from '@common/middlewares/requestLogger';
import { globalRateLimiter } from '@common/middlewares/rateLimiter';
import { errorHandler } from '@common/middlewares/errorHandler';
import { notFound } from '@common/middlewares/notFound';
import { swaggerRouter } from '@docs/swagger';

// Module route imports
import { authRoutes } from '@modules/auth';
import { customerRoutes } from '@modules/customer';
import { employeeRoutes } from '@modules/employee';
import { serviceCategoryRoutes, serviceRoutes } from '@modules/service-catalog';
import { vehicleRoutes } from '@modules/vehicle';
import { supplierRoutes } from '@modules/supplier';
import { inventoryRoutes } from '@modules/inventory';
import { workOrderRoutes } from '@modules/work-order';
import { purchaseOrderRoutes } from '@modules/purchase-order';
import { invoiceRoutes } from '@modules/invoice';
import { appointmentRoutes } from '@modules/appointment';
import { paymentRoutes } from '@modules/payment';
import { serviceHistoryRoutes } from '@modules/service-history';
import { expenseRoutes } from '@modules/expense';
import { dashboardRoutes } from '@modules/dashboard';

/**
 * Express application setup.
 *
 * Registers global middlewares, mounts module routers,
 * and attaches error handling.
 */
const app = express();

// ============================================
// GLOBAL MIDDLEWARES
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gzip compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(globalRateLimiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Car Workshop API is running',
    data: {
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================
// API DOCS
// ============================================

app.use('/api/docs', swaggerRouter);

// ============================================
// API ROUTES (v1)
// ============================================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);

// Phase 1 — Core Entities
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/employees`, employeeRoutes);
app.use(`${API_PREFIX}/service-categories`, serviceCategoryRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);

// Phase 2 — Dependent Entities
app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);

// Phase 3 — Inventory & Work Orders
app.use(`${API_PREFIX}/parts`, inventoryRoutes);
app.use(`${API_PREFIX}/work-orders`, workOrderRoutes);

// Phase 4 — Purchase Orders, Invoices & Appointments
app.use(`${API_PREFIX}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentRoutes);

// Phase 5 — Payments, Service History, Expenses & Dashboard
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/service-history`, serviceHistoryRoutes);
app.use(`${API_PREFIX}/expenses`, expenseRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// ============================================
// ERROR HANDLING (must be last)
// ============================================

// 404 catch-all
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
