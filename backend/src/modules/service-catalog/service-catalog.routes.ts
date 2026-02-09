import { Router } from 'express';
import { serviceCatalogController } from './service-catalog.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { authorize } from '@common/middlewares/authorize';
import { validate } from '@common/middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  serviceListSchema,
} from './service-catalog.validation';

// ══════════════════════════════════════════════
// CATEGORY ROUTES
// ══════════════════════════════════════════════

const categoryRouter = Router();

categoryRouter.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
categoryRouter.get('/', serviceCatalogController.findAllCategories);
categoryRouter.get('/:id', validate(categoryIdSchema), serviceCatalogController.findCategoryById);
categoryRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createCategorySchema),
  serviceCatalogController.createCategory,
);
categoryRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateCategorySchema),
  serviceCatalogController.updateCategory,
);
categoryRouter.delete(
  '/:id',
  authorize('ADMIN'),
  validate(categoryIdSchema),
  serviceCatalogController.deleteCategory,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

// ══════════════════════════════════════════════
// SERVICE ROUTES
// ══════════════════════════════════════════════

const serviceRouter = Router();

serviceRouter.use(authenticate);

/* eslint-disable @typescript-eslint/no-misused-promises */
serviceRouter.get('/', validate(serviceListSchema), serviceCatalogController.findAllServices);
serviceRouter.get('/:id', validate(serviceIdSchema), serviceCatalogController.findServiceById);
serviceRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createServiceSchema),
  serviceCatalogController.createService,
);
serviceRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateServiceSchema),
  serviceCatalogController.updateService,
);
serviceRouter.delete(
  '/:id',
  authorize('ADMIN'),
  validate(serviceIdSchema),
  serviceCatalogController.deleteService,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export { categoryRouter, serviceRouter };
