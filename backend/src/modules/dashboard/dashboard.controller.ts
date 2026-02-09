import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type { DashboardDateRange } from './dashboard.types';

/**
 * Dashboard Controller — HTTP layer (read-only analytics).
 */
class DashboardController {
  getSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const range = req.query as unknown as DashboardDateRange;
    const data = await dashboardService.getSummary(range);
    apiResponse.success(res, data, 'Dashboard summary retrieved successfully');
  });

  getRevenueOverTime = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const range = req.query as unknown as DashboardDateRange;
    const data = await dashboardService.getRevenueOverTime(range);
    apiResponse.success(res, data, 'Revenue data retrieved successfully');
  });

  getWorkOrdersByStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const data = await dashboardService.getWorkOrdersByStatus();
    apiResponse.success(res, data, 'Work orders by status retrieved successfully');
  });

  getMechanicProductivity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const range = req.query as unknown as DashboardDateRange;
    const data = await dashboardService.getMechanicProductivity(range);
    apiResponse.success(res, data, 'Mechanic productivity retrieved successfully');
  });

  getTopServices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await dashboardService.getTopServices(limit);
    apiResponse.success(res, data, 'Top services retrieved successfully');
  });

  getInventoryAlerts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const data = await dashboardService.getInventoryAlerts();
    apiResponse.success(res, data, 'Inventory alerts retrieved successfully');
  });

  getRevenueVsExpenses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const range = req.query as unknown as DashboardDateRange;
    const data = await dashboardService.getRevenueVsExpenses(range);
    apiResponse.success(res, data, 'Revenue vs expenses retrieved successfully');
  });
}

export const dashboardController = new DashboardController();
