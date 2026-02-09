import { Request, Response } from 'express';
import { invoiceService } from './invoice.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceListInput,
} from './invoice.validation';

/**
 * Invoice Controller — HTTP layer for invoice endpoints.
 */
class InvoiceController {
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as InvoiceListInput;
    const result = await invoiceService.findAll(query);
    apiResponse.paginated(res, result.data, result.meta, 'Invoices retrieved successfully');
  });

  getOutstanding = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const invoices = await invoiceService.getOutstanding();
    apiResponse.success(res, invoices, 'Outstanding invoices retrieved successfully');
  });

  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const invoice = await invoiceService.findById(id);
    apiResponse.success(res, invoice, 'Invoice retrieved successfully');
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const invoice = await invoiceService.create(req.body as CreateInvoiceInput);
    apiResponse.created(res, invoice, 'Invoice created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const invoice = await invoiceService.update(id, req.body as UpdateInvoiceInput);
    apiResponse.success(res, invoice, 'Invoice updated successfully');
  });
}

export const invoiceController = new InvoiceController();
