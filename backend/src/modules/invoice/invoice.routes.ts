import { Router } from 'express';
import { invoiceController } from './invoice.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceIdSchema,
  invoiceListSchema,
} from './invoice.validation';

const router = Router();

/**
 * Invoice Routes — all require authentication.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/outstanding', invoiceController.getOutstanding);
router.get('/', validate(invoiceListSchema), invoiceController.findAll);
router.get('/:id', validate(invoiceIdSchema), invoiceController.findById);
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createInvoiceSchema),
  invoiceController.create,
);
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateInvoiceSchema),
  invoiceController.update,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
