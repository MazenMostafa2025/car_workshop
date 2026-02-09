import { Router } from 'express';
import { customerController } from './customer.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
  customerListSchema,
} from './customer.validation';

const router = Router();

/**
 * Customer Routes — all require authentication.
 *
 * GET    /                — List customers (paginated, searchable)
 * GET    /:id             — Get customer by ID (with vehicles)
 * POST   /                — Create customer
 * PATCH  /:id             — Update customer
 * DELETE /:id             — Soft-delete customer (ADMIN / MANAGER only)
 */

// All customer routes require authentication
router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(customerListSchema), customerController.findAll);
router.get('/:id', validate(customerIdSchema), customerController.findById);
router.post('/', validate(createCustomerSchema), customerController.create);
router.patch('/:id', validate(updateCustomerSchema), customerController.update);
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(customerIdSchema),
  customerController.delete,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
