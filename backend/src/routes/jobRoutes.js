import { Router } from 'express';
import * as controller from '../controllers/jobController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { jobFeatureSchema, jobSchema, jobStatusSchema } from '../validators/jobValidators.js';

const router = Router();

// Fixed paths must come before "/:id" or they would be read as an id.
router.get('/', optionalAuth, controller.listJobs);
router.get('/popular-searches', controller.popularSearches);
router.get('/stats', controller.platformStats);
router.get('/recommended', protect, authorize('JOB_SEEKER'), controller.recommendedJobs);
router.get('/employer/mine', protect, authorize('EMPLOYER'), controller.myJobs);

router.post('/', protect, authorize('EMPLOYER'), validate(jobSchema), controller.createJob);
router.post('/:id/duplicate', protect, authorize('EMPLOYER'), controller.duplicateJob);
router.get('/:id/related', controller.relatedJobs);
router.get('/:id', optionalAuth, controller.getJob);
router.put('/:id', protect, authorize('EMPLOYER', 'ADMIN'), validate(jobSchema), controller.updateJob);
router.patch('/:id/status', protect, authorize('EMPLOYER', 'ADMIN'), validate(jobStatusSchema), controller.changeStatus);
router.patch('/:id/feature', protect, authorize('ADMIN'), validate(jobFeatureSchema), controller.featureJob);
router.delete('/:id', protect, authorize('EMPLOYER', 'ADMIN'), controller.deleteJob);

export default router;
