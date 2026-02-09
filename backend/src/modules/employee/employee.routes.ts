import { Router } from 'express';
import { employeeController } from './employee.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdSchema,
  employeeListSchema,
} from './employee.validation';

const router = Router();

/**
 * Employee Routes — all require authentication.
 *
 * GET    /                — List employees (paginated, filterable by role)
 * GET    /:id             — Get employee by ID
 * POST   /                — Create employee (ADMIN / MANAGER only)
 * PATCH  /:id             — Update employee (ADMIN / MANAGER only)
 * DELETE /:id             — Soft-delete employee (ADMIN only)
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(employeeListSchema), employeeController.findAll);
router.get('/:id', validate(employeeIdSchema), employeeController.findById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createEmployeeSchema),
  employeeController.create,
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateEmployeeSchema),
  employeeController.update,
);
router.delete('/:id', authorize('ADMIN'), validate(employeeIdSchema), employeeController.delete);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
