import { Router } from 'express';
import { purchaseOrderController } from './purchase-order.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  receivePurchaseOrderSchema,
  addPOItemSchema,
  updatePOItemSchema,
  removePOItemSchema,
  purchaseOrderIdSchema,
  purchaseOrderListSchema,
} from './purchase-order.validation';

const router = Router();

/**
 * Purchase Order Routes — all require authentication; write ops ADMIN/MANAGER.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(purchaseOrderListSchema), purchaseOrderController.findAll);
router.get('/:id', validate(purchaseOrderIdSchema), purchaseOrderController.findById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createPurchaseOrderSchema),
  purchaseOrderController.create,
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updatePurchaseOrderSchema),
  purchaseOrderController.update,
);
router.patch(
  '/:id/receive',
  authorize('ADMIN', 'MANAGER'),
  validate(receivePurchaseOrderSchema),
  purchaseOrderController.receive,
);

// Items sub-resource
router.post(
  '/:id/items',
  authorize('ADMIN', 'MANAGER'),
  validate(addPOItemSchema),
  purchaseOrderController.addItem,
);
router.patch(
  '/:id/items/:itemId',
  authorize('ADMIN', 'MANAGER'),
  validate(updatePOItemSchema),
  purchaseOrderController.updateItem,
);
router.delete(
  '/:id/items/:itemId',
  authorize('ADMIN', 'MANAGER'),
  validate(removePOItemSchema),
  purchaseOrderController.removeItem,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
