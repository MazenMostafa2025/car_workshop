import { Request, Response } from 'express';
import { purchaseOrderService } from './purchase-order.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ReceivePurchaseOrderInput,
  AddPOItemInput,
  UpdatePOItemInput,
  PurchaseOrderListInput,
} from './purchase-order.validation';

/**
 * Purchase Order Controller — HTTP layer for purchase order endpoints.
 */
class PurchaseOrderController {
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as PurchaseOrderListInput;
    const result = await purchaseOrderService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Purchase orders retrieved successfully');
  });

  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const po = await purchaseOrderService.findById(id);
    apiResponse.success(res, po, 'Purchase order retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const po = await purchaseOrderService.create(req.body as CreatePurchaseOrderInput);
    apiResponse.created(res, po, 'Purchase order created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const po = await purchaseOrderService.update(id, req.body as UpdatePurchaseOrderInput);
    apiResponse.success(res, po, 'Purchase order updated successfully');
  });

  receive = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const po = await purchaseOrderService.receive(id, req.body as ReceivePurchaseOrderInput);
    apiResponse.success(res, po, 'Purchase order received — inventory updated');
  });

  addItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const item = await purchaseOrderService.addItem(id, req.body as AddPOItemInput);
    apiResponse.created(res, item, 'Item added to purchase order');
  });

  updateItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const poId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    const item = await purchaseOrderService.updateItem(poId, itemId, req.body as UpdatePOItemInput);
    apiResponse.success(res, item, 'Purchase order item updated');
  });

  removeItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const poId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    await purchaseOrderService.removeItem(poId, itemId);
    apiResponse.noContent(res);
  });
}

export const purchaseOrderController = new PurchaseOrderController();
