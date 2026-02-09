import { Request, Response } from 'express';
import { workOrderService } from './work-order.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  StatusTransitionInput,
  AddServiceInput,
  UpdateServiceInput,
  AddPartInput,
  UpdatePartInput as UpdateWOPartInput,
  WorkOrderListInput,
} from './work-order.validation';

/**
 * Work Order Controller — HTTP layer for work order endpoints.
 */
class WorkOrderController {
  // ── Work Order CRUD ─────────────────────────────────────

  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as WorkOrderListInput;
    const result = await workOrderService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Work orders retrieved successfully');
  });

  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const wo = await workOrderService.findById(id);
    apiResponse.success(res, wo, 'Work order retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const wo = await workOrderService.create(req.body as CreateWorkOrderInput);
    apiResponse.created(res, wo, 'Work order created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const wo = await workOrderService.update(id, req.body as UpdateWorkOrderInput);
    apiResponse.success(res, wo, 'Work order updated successfully');
  });

  // ── Status Transition ───────────────────────────────────

  transitionStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { status } = req.body as StatusTransitionInput;
    const wo = await workOrderService.transitionStatus(id, status);
    apiResponse.success(res, wo, `Work order status changed to ${status}`);
  });

  // ── Sub-resource: Services ──────────────────────────────

  getServices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const services = await workOrderService.getServices(id);
    apiResponse.success(res, services, 'Work order services retrieved successfully');
  });

  addService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const svc = await workOrderService.addService(id, req.body as AddServiceInput);
    apiResponse.created(res, svc, 'Service added to work order');
  });

  updateService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workOrderId = Number(req.params.id);
    const serviceId = Number(req.params.serviceId);
    const svc = await workOrderService.updateService(
      workOrderId,
      serviceId,
      req.body as UpdateServiceInput,
    );
    apiResponse.success(res, svc, 'Work order service updated');
  });

  removeService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workOrderId = Number(req.params.id);
    const serviceId = Number(req.params.serviceId);
    await workOrderService.removeService(workOrderId, serviceId);
    apiResponse.noContent(res);
  });

  // ── Sub-resource: Parts ─────────────────────────────────

  getParts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const parts = await workOrderService.getParts(id);
    apiResponse.success(res, parts, 'Work order parts retrieved successfully');
  });

  addPart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const part = await workOrderService.addPart(id, req.body as AddPartInput);
    apiResponse.created(res, part, 'Part added to work order');
  });

  updatePart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workOrderId = Number(req.params.id);
    const partId = Number(req.params.partId);
    const part = await workOrderService.updatePart(
      workOrderId,
      partId,
      req.body as UpdateWOPartInput,
    );
    apiResponse.success(res, part, 'Work order part updated');
  });

  removePart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workOrderId = Number(req.params.id);
    const partId = Number(req.params.partId);
    await workOrderService.removePart(workOrderId, partId);
    apiResponse.noContent(res);
  });
}

export const workOrderController = new WorkOrderController();
