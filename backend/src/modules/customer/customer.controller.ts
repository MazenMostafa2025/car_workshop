import { Request, Response } from 'express';
import { customerService } from './customer.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListInput,
} from './customer.validation';

/**
 * Customer Controller — HTTP layer for customer endpoints.
 */
class CustomerController {
  /**
   * GET /api/v1/customers
   */
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as CustomerListInput;
    const result = await customerService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Customers retrieved successfully');
  });

  /**
   * GET /api/v1/customers/:id
   */
  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const customer = await customerService.findById(id);
    apiResponse.success(res, customer, 'Customer retrieved successfully');
  });

  /**
   * POST /api/v1/customers
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customer = await customerService.create(req.body as CreateCustomerInput);
    apiResponse.created(res, customer, 'Customer created successfully');
  });

  /**
   * PATCH /api/v1/customers/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const customer = await customerService.update(id, req.body as UpdateCustomerInput);
    apiResponse.success(res, customer, 'Customer updated successfully');
  });

  /**
   * DELETE /api/v1/customers/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await customerService.delete(id);
    apiResponse.noContent(res);
  });
}

export const customerController = new CustomerController();
