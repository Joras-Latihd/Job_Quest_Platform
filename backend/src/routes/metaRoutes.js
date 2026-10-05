import { Router } from 'express';
import * as controller from '../controllers/metaController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categorySchema, categoryUpdateSchema, locationSchema, locationUpdateSchema } from '../validators/miscValidators.js';

export const categoryRouter = Router();
categoryRouter.get('/', optionalAuth, controller.listCategories);
categoryRouter.post('/', protect, authorize('ADMIN'), validate(categorySchema), controller.createCategory);
categoryRouter.put('/:id', protect, authorize('ADMIN'), validate(categoryUpdateSchema), controller.updateCategory);
categoryRouter.delete('/:id', protect, authorize('ADMIN'), controller.deleteCategory);

export const locationRouter = Router();
locationRouter.get('/', optionalAuth, controller.listLocations);
locationRouter.post('/', protect, authorize('ADMIN'), validate(locationSchema), controller.createLocation);
locationRouter.put('/:id', protect, authorize('ADMIN'), validate(locationUpdateSchema), controller.updateLocation);
locationRouter.delete('/:id', protect, authorize('ADMIN'), controller.deleteLocation);
