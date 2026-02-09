import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createPartSchema,
  updatePartSchema,
  adjustStockSchema,
  partIdSchema,
  partListSchema,
} from './inventory.validation';

const router = Router();

/**
 * Inventory (Parts) Routes — all require authentication.
 *
 * GET    /                    — List parts (paginated, filterable)
 * GET    /low-stock           — Parts at or below reorder level
 * GET    /inventory-value     — Total inventory cost & retail value
 * GET    /:id                 — Get part detail with supplier
 * POST   /                    — Create part             (ADMIN / MANAGER)
 * PATCH  /:id                 — Update part             (ADMIN / MANAGER)
 * PATCH  /:id/adjust-stock    — Manual stock adjustment (ADMIN / MANAGER)
 * DELETE /:id                 — Deactivate part         (ADMIN / MANAGER)
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
// Named routes before :id to avoid param conflicts
router.get('/low-stock', inventoryController.getLowStock);
router.get('/inventory-value', inventoryController.getInventoryValue);
router.get('/', validate(partListSchema), inventoryController.findAll);
router.get('/:id', validate(partIdSchema), inventoryController.findById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createPartSchema),
  inventoryController.create,
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updatePartSchema),
  inventoryController.update,
);
router.patch(
  '/:id/adjust-stock',
  authorize('ADMIN', 'MANAGER'),
  validate(adjustStockSchema),
  inventoryController.adjustStock,
);
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(partIdSchema),
  inventoryController.delete,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
