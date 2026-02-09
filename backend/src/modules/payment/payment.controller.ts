import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type { CreatePaymentInput, PaymentListInput } from './payment.validation';

/**
 * Payment Controller — HTTP layer for payment endpoints.
 */
class PaymentController {
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as PaymentListInput;
    const result = await paymentService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Payments retrieved successfully');
  });

  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const payment = await paymentService.findById(id);
    apiResponse.success(res, payment, 'Payment retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentService.create(req.body as CreatePaymentInput);
    apiResponse.created(res, payment, 'Payment recorded successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await paymentService.delete(id);
    apiResponse.noContent(res);
  });
}

export const paymentController = new PaymentController();
