import { Request, Response } from 'express';
import { serviceHistoryService } from './service-history.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type { ServiceHistoryListInput } from './service-history.validation';

/**
 * Service History Controller — HTTP layer (read-only).
 */
class ServiceHistoryController {
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ServiceHistoryListInput;
    const result = await serviceHistoryService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Service history retrieved successfully');
  });

  findByVehicle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vehicleId = Number(req.params.vehicleId);
    const query = {
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
    };
    const result = await serviceHistoryService.findByVehicle(vehicleId, query);
    res.status(200).json({
      success: true,
      message: 'Vehicle service history retrieved successfully',
      data: result.data,
      meta: result.meta,
      summary: result.summary,
    });
  });
}

export const serviceHistoryController = new ServiceHistoryController();
