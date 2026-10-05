import { Router } from 'express';
import * as controller from '../controllers/companyController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadCompanyImages } from '../middleware/upload.js';
import { companySchema } from '../validators/companyValidators.js';

const router = Router();

router.get('/', controller.listCompanies);
router.get('/my', protect, authorize('EMPLOYER'), controller.myCompany);
router.get('/my/dashboard', protect, authorize('EMPLOYER'), controller.dashboard);
router.post('/', protect, authorize('EMPLOYER'), uploadCompanyImages, validate(companySchema), controller.createCompany);
router.get('/:id', optionalAuth, controller.getCompany);
router.put('/:id', protect, authorize('EMPLOYER', 'ADMIN'), uploadCompanyImages, validate(companySchema), controller.updateCompany);

export default router;
