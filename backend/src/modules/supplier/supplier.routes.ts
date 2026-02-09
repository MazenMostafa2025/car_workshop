import { Router } from 'express';
import { supplierController } from './supplier.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierIdSchema,
  supplierListSchema,
} from './supplier.validation';

const router = Router();

/**
 * Supplier Routes — all require authentication.
 *
 * GET    /             — List suppliers (paginated, searchable)
 * GET    /:id          — Get supplier by ID (with counts)
 * GET    /:id/parts    — Get supplier's parts list
 * POST   /             — Create supplier     (ADMIN / MANAGER only)
 * PATCH  /:id          — Update supplier     (ADMIN / MANAGER only)
 * DELETE /:id          — Delete supplier     (ADMIN / MANAGER only)
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(supplierListSchema), supplierController.findAll);
router.get('/:id', validate(supplierIdSchema), supplierController.findById);
router.get('/:id/parts', validate(supplierIdSchema), supplierController.findParts);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createSupplierSchema),
  supplierController.create,
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateSupplierSchema),
  supplierController.update,
);
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(supplierIdSchema),
  supplierController.delete,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
