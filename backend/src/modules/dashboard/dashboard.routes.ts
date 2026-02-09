import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';

const router = Router();

/**
 * Dashboard Routes — admin/manager-only analytics endpoints.
 */

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/summary', dashboardController.getSummary);
router.get('/revenue', dashboardController.getRevenueOverTime);
router.get('/work-orders-by-status', dashboardController.getWorkOrdersByStatus);
router.get('/mechanic-productivity', dashboardController.getMechanicProductivity);
router.get('/top-services', dashboardController.getTopServices);
router.get('/inventory-alerts', dashboardController.getInventoryAlerts);
router.get('/revenue-vs-expenses', dashboardController.getRevenueVsExpenses);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
