import { Request, Response } from 'express';
import { expenseService } from './expense.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseListInput,
  ExpenseSummaryInput,
} from './expense.validation';

/**
 * Expense Controller — HTTP layer for expense endpoints.
 */
class ExpenseController {
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ExpenseListInput;
    const result = await expenseService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Expenses retrieved successfully');
  });

  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const expense = await expenseService.findById(id);
    apiResponse.success(res, expense, 'Expense retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = req.body as CreateExpenseInput;
    const expense = await expenseService.create(body);
    apiResponse.created(res, expense, 'Expense created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const body = req.body as UpdateExpenseInput;
    const expense = await expenseService.update(id, body);
    apiResponse.success(res, expense, 'Expense updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await expenseService.delete(id);
    apiResponse.noContent(res);
  });

  getSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ExpenseSummaryInput;
    const summary = await expenseService.getSummary(query);
    apiResponse.success(res, summary, 'Expense summary retrieved successfully');
  });
}

export const expenseController = new ExpenseController();
