import { Router } from 'express';
import { appointmentController } from './appointment.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { validate } from '@common/middlewares/validate';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentStatusSchema,
  convertAppointmentSchema,
  availableSlotsSchema,
  appointmentIdSchema,
  appointmentListSchema,
} from './appointment.validation';

const router = Router();

/**
 * Appointment Routes — all require authentication.
 */

router.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get(
  '/available-slots',
  validate(availableSlotsSchema),
  appointmentController.getAvailableSlots,
);
router.get('/', validate(appointmentListSchema), appointmentController.findAll);
router.get('/:id', validate(appointmentIdSchema), appointmentController.findById);
router.post('/', validate(createAppointmentSchema), appointmentController.create);
router.patch('/:id', validate(updateAppointmentSchema), appointmentController.update);
router.patch(
  '/:id/status',
  validate(appointmentStatusSchema),
  appointmentController.transitionStatus,
);
router.post('/:id/convert', validate(convertAppointmentSchema), appointmentController.convert);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
