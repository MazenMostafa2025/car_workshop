import { Request, Response } from 'express';
import { serviceCatalogService } from './service-catalog.service';
import { apiResponse } from '@common/utils/apiResponse';
import { asyncHandler } from '@common/utils/asyncHandler';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceListInput,
} from './service-catalog.validation';

/**
 * Service Catalog Controller — HTTP layer for categories & services.
 */
class ServiceCatalogController {
  // ══════════════════════════════════════════════
  // CATEGORIES
  // ══════════════════════════════════════════════

  findAllCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await serviceCatalogService.findAllCategories();
    apiResponse.success(res, categories, 'Categories retrieved successfully');
  });

  findCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const category = await serviceCatalogService.findCategoryById(id);
    apiResponse.success(res, category, 'Category retrieved successfully');
  });

  createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await serviceCatalogService.createCategory(req.body as CreateCategoryInput);
    apiResponse.created(res, category, 'Category created successfully');
  });

  updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const category = await serviceCatalogService.updateCategory(
      id,
      req.body as UpdateCategoryInput,
    );
    apiResponse.success(res, category, 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await serviceCatalogService.deleteCategory(id);
    apiResponse.noContent(res);
  });

  // ══════════════════════════════════════════════
  // SERVICES
  // ══════════════════════════════════════════════

  findAllServices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ServiceListInput;
    const result = await serviceCatalogService.findAllServices(query);
    apiResponse.paginated(res, result.data, result.meta, 'Services retrieved successfully');
  });

  findServiceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const service = await serviceCatalogService.findServiceById(id);
    apiResponse.success(res, service, 'Service retrieved successfully');
  });

  createService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const service = await serviceCatalogService.createService(req.body as CreateServiceInput);
    apiResponse.created(res, service, 'Service created successfully');
  });

  updateService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const service = await serviceCatalogService.updateService(id, req.body as UpdateServiceInput);
    apiResponse.success(res, service, 'Service updated successfully');
  });

  deleteService = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    await serviceCatalogService.deleteService(id);
    apiResponse.noContent(res);
  });
}

export const serviceCatalogController = new ServiceCatalogController();
