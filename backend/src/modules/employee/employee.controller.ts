import { Request, Response } from 'express';
import { employeeService } from './employee.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeListInput,
} from './employee.validation';

/**
 * Employee Controller — HTTP layer for employee endpoints.
 */
class EmployeeController {
  /**
   * GET /api/v1/employees
   */
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as EmployeeListInput;
    const result = await employeeService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Employees retrieved successfully');
  });

  /**
   * GET /api/v1/employees/:id
   */
  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const employee = await employeeService.findById(id);
    apiResponse.success(res, employee, 'Employee retrieved successfully');
  });

  /**
   * POST /api/v1/employees
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const employee = await employeeService.create(req.body as CreateEmployeeInput);
    apiResponse.created(res, employee, 'Employee created successfully');
  });

  /**
   * PATCH /api/v1/employees/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const employee = await employeeService.update(id, req.body as UpdateEmployeeInput);
    apiResponse.success(res, employee, 'Employee updated successfully');
  });

  /**
   * DELETE /api/v1/employees/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await employeeService.delete(id);
    apiResponse.noContent(res);
  });
}

export const employeeController = new EmployeeController();
