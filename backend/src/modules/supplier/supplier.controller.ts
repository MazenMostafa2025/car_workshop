import { Request, Response } from 'express';
import { supplierService } from './supplier.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierListInput,
} from './supplier.validation';

/**
 * Supplier Controller — HTTP layer for supplier endpoints.
 */
class SupplierController {
  /**
   * GET /api/v1/suppliers
   */
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as SupplierListInput;
    const result = await supplierService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Suppliers retrieved successfully');
  });

  /**
   * GET /api/v1/suppliers/:id
   */
  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const supplier = await supplierService.findById(id);
    apiResponse.success(res, supplier, 'Supplier retrieved successfully');
  });

  /**
   * GET /api/v1/suppliers/:id/parts
   */
  findParts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const supplier = await supplierService.findParts(id);
    apiResponse.success(res, supplier, 'Supplier parts retrieved successfully');
  });

  /**
   * POST /api/v1/suppliers
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const supplier = await supplierService.create(req.body as CreateSupplierInput);
    apiResponse.created(res, supplier, 'Supplier created successfully');
  });

  /**
   * PATCH /api/v1/suppliers/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const supplier = await supplierService.update(id, req.body as UpdateSupplierInput);
    apiResponse.success(res, supplier, 'Supplier updated successfully');
  });

  /**
   * DELETE /api/v1/suppliers/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await supplierService.delete(id);
    apiResponse.noContent(res);
  });
}

export const supplierController = new SupplierController();
