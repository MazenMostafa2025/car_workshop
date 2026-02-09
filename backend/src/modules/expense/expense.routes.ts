import { Router } from 'express';
import { expenseController } from './expense.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdSchema,
  expenseListSchema,
  expenseSummarySchema,
} from './expense.validation';

const router = Router();

/**
 * Expense Routes — all require authentication.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/summary', validate(expenseSummarySchema), expenseController.getSummary);
router.get('/', validate(expenseListSchema), expenseController.findAll);
router.get('/:id', validate(expenseIdSchema), expenseController.findById);
router.post('/', validate(createExpenseSchema), expenseController.create);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateExpenseSchema),
  expenseController.update,
);
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(expenseIdSchema),
  expenseController.delete,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
