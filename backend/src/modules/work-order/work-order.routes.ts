import { Router } from 'express';
import { workOrderController } from './work-order.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { validate } from '@common/middlewares/validate';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  statusTransitionSchema,
  addServiceSchema,
  updateServiceSchema,
  removeServiceSchema,
  addPartSchema,
  updatePartSchema,
  removePartSchema,
  workOrderIdSchema,
  workOrderListSchema,
} from './work-order.validation';

const router = Router();

/**
 * Work Order Routes — all require authentication.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */

// ── Core CRUD ─────────────────────────────────────────────
router.get('/', validate(workOrderListSchema), workOrderController.findAll);
router.get('/:id', validate(workOrderIdSchema), workOrderController.findById);
router.post('/', validate(createWorkOrderSchema), workOrderController.create);
router.patch('/:id', validate(updateWorkOrderSchema), workOrderController.update);
router.patch('/:id/status', validate(statusTransitionSchema), workOrderController.transitionStatus);

// ── Sub-resource: Services ────────────────────────────────
router.get('/:id/services', validate(workOrderIdSchema), workOrderController.getServices);
router.post('/:id/services', validate(addServiceSchema), workOrderController.addService);
router.patch(
  '/:id/services/:serviceId',
  validate(updateServiceSchema),
  workOrderController.updateService,
);
router.delete(
  '/:id/services/:serviceId',
  validate(removeServiceSchema),
  workOrderController.removeService,
);

// ── Sub-resource: Parts ───────────────────────────────────
router.get('/:id/parts', validate(workOrderIdSchema), workOrderController.getParts);
router.post('/:id/parts', validate(addPartSchema), workOrderController.addPart);
router.patch('/:id/parts/:partId', validate(updatePartSchema), workOrderController.updatePart);
router.delete('/:id/parts/:partId', validate(removePartSchema), workOrderController.removePart);

/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
