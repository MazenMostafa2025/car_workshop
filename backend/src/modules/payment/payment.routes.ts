import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import { createPaymentSchema, paymentIdSchema, paymentListSchema } from './payment.validation';

const router = Router();

/**
 * Payment Routes — all require authentication.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(paymentListSchema), paymentController.findAll);
router.get('/:id', validate(paymentIdSchema), paymentController.findById);
router.post('/', validate(createPaymentSchema), paymentController.create);
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(paymentIdSchema),
  paymentController.delete,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
