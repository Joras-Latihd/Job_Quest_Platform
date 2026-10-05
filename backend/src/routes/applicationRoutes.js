import { Router } from 'express';
import * as controller from '../controllers/applicationController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { applicationStatusSchema, applySchema } from '../validators/applicationValidators.js';

const router = Router();
router.use(protect);

router.post('/', authorize('JOB_SEEKER'), validate(applySchema), controller.apply);
router.get('/my', authorize('JOB_SEEKER'), controller.myApplications);
router.get('/employer', authorize('EMPLOYER'), controller.employerApplications);
router.get('/job/:jobId', authorize('EMPLOYER', 'ADMIN'), controller.jobApplications);
router.get('/:id', controller.getApplication); // access is checked inside the service (owner / job owner / admin)
router.patch('/:id/status', authorize('EMPLOYER', 'ADMIN'), validate(applicationStatusSchema), controller.updateStatus);
router.patch('/:id/withdraw', authorize('JOB_SEEKER'), controller.withdraw);

export default router;
