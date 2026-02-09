import { Router } from 'express';
import { vehicleController } from './vehicle.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
  vehicleListSchema,
} from './vehicle.validation';

const router = Router();

/**
 * Vehicle Routes — all require authentication.
 *
 * GET    /                    — List vehicles (paginated, searchable)
 * GET    /:id                 — Get vehicle by ID (with customer)
 * GET    /:id/service-history — Get service history for vehicle
 * POST   /                    — Create vehicle
 * PATCH  /:id                 — Update vehicle
 * DELETE /:id                 — Soft-delete vehicle (ADMIN / MANAGER only)
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', validate(vehicleListSchema), vehicleController.findAll);
router.get('/:id', validate(vehicleIdSchema), vehicleController.findById);
router.get('/:id/service-history', validate(vehicleIdSchema), vehicleController.getServiceHistory);
router.post('/', validate(createVehicleSchema), vehicleController.create);
router.patch('/:id', validate(updateVehicleSchema), vehicleController.update);
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(vehicleIdSchema),
  vehicleController.delete,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
