import { Router } from 'express';
import { serviceHistoryController } from './service-history.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { validate } from '@common/middlewares/validate';
import { serviceHistoryListSchema, vehicleHistorySchema } from './service-history.validation';

const router = Router();

/**
 * Service History Routes — all require authentication, read-only.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(serviceHistoryListSchema), serviceHistoryController.findAll);
router.get(
  '/vehicle/:vehicleId',
  validate(vehicleHistorySchema),
  serviceHistoryController.findByVehicle,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
