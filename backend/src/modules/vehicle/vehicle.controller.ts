import { Request, Response } from 'express';
import { vehicleService } from './vehicle.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListInput,
} from './vehicle.validation';

/**
 * Vehicle Controller — HTTP layer for vehicle endpoints.
 */
class VehicleController {
  /**
   * GET /api/v1/vehicles
   */
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as VehicleListInput;
    const result = await vehicleService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Vehicles retrieved successfully');
  });

  /**
   * GET /api/v1/vehicles/:id
   */
  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const vehicle = await vehicleService.findById(id);
    apiResponse.success(res, vehicle, 'Vehicle retrieved successfully');
  });

  /**
   * POST /api/v1/vehicles
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vehicle = await vehicleService.create(req.body as CreateVehicleInput);
    apiResponse.created(res, vehicle, 'Vehicle created successfully');
  });

  /**
   * PATCH /api/v1/vehicles/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const vehicle = await vehicleService.update(id, req.body as UpdateVehicleInput);
    apiResponse.success(res, vehicle, 'Vehicle updated successfully');
  });

  /**
   * DELETE /api/v1/vehicles/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await vehicleService.delete(id);
    apiResponse.noContent(res);
  });

  /**
   * GET /api/v1/vehicles/:id/service-history
   */
  getServiceHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const history = await vehicleService.getServiceHistory(id);
    apiResponse.success(res, history, 'Vehicle service history retrieved successfully');
  });
}

export const vehicleController = new VehicleController();
