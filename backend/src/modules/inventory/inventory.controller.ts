import { Request, Response } from 'express';
import { inventoryService } from './inventory.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreatePartInput,
  UpdatePartInput,
  AdjustStockInput,
  PartListInput,
} from './inventory.validation';

/**
 * Inventory Controller — HTTP layer for parts/inventory endpoints.
 */
class InventoryController {
  /** GET /api/v1/parts */
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as PartListInput;
    const result = await inventoryService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Parts retrieved successfully');
  });

  /** GET /api/v1/parts/low-stock */
  getLowStock = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const parts = await inventoryService.getLowStock();
    apiResponse.success(res, parts, 'Low-stock parts retrieved successfully');
  });

  /** GET /api/v1/parts/inventory-value */
  getInventoryValue = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const value = await inventoryService.getInventoryValue();
    apiResponse.success(res, value, 'Inventory value calculated successfully');
  });

  /** GET /api/v1/parts/:id */
  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const part = await inventoryService.findById(id);
    apiResponse.success(res, part, 'Part retrieved successfully');
  });

  /** POST /api/v1/parts */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const part = await inventoryService.create(req.body as CreatePartInput);
    apiResponse.created(res, part, 'Part created successfully');
  });

  /** PATCH /api/v1/parts/:id */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const part = await inventoryService.update(id, req.body as UpdatePartInput);
    apiResponse.success(res, part, 'Part updated successfully');
  });

  /** PATCH /api/v1/parts/:id/adjust-stock */
  adjustStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const part = await inventoryService.adjustStock(id, req.body as AdjustStockInput);
    apiResponse.success(res, part, 'Stock adjusted successfully');
  });

  /** DELETE /api/v1/parts/:id */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await inventoryService.delete(id);
    apiResponse.noContent(res);
  });
}

export const inventoryController = new InventoryController();
