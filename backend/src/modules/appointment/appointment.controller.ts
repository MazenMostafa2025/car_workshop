import { Request, Response } from 'express';
import { appointmentService } from './appointment.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentStatusInput,
  ConvertAppointmentInput,
  AvailableSlotsInput,
  AppointmentListInput,
} from './appointment.validation';

/**
 * Appointment Controller — HTTP layer for appointment endpoints.
 */
class AppointmentController {
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AppointmentListInput;
    const result = await appointmentService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Appointments retrieved successfully');
  });

  getAvailableSlots = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AvailableSlotsInput;
    const slots = await appointmentService.getAvailableSlots(
      query.date,
      query.mechanicId,
      query.duration,
    );
    apiResponse.success(res, slots, 'Available slots retrieved successfully');
  });

  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const appointment = await appointmentService.findById(id);
    apiResponse.success(res, appointment, 'Appointment retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const appointment = await appointmentService.create(req.body as CreateAppointmentInput);
    apiResponse.created(res, appointment, 'Appointment created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const appointment = await appointmentService.update(id, req.body as UpdateAppointmentInput);
    apiResponse.success(res, appointment, 'Appointment updated successfully');
  });

  transitionStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { status } = req.body as AppointmentStatusInput;
    const appointment = await appointmentService.transitionStatus(id, status);
    apiResponse.success(res, appointment, `Appointment status changed to ${status}`);
  });

  convert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const workOrder = await appointmentService.convertToWorkOrder(
      id,
      req.body as ConvertAppointmentInput,
    );
    apiResponse.created(res, workOrder, 'Appointment converted to work order');
  });
}

export const appointmentController = new AppointmentController();
