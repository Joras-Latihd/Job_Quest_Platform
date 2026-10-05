import { Router } from 'express';
import * as controller from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadProfileImage, uploadResumeFile } from '../middleware/upload.js';
import { profileSchema } from '../validators/userValidators.js';

const router = Router();
router.use(protect);

router.get('/dashboard', authorize('JOB_SEEKER'), controller.dashboard);
router.put('/profile', validate(profileSchema), controller.updateProfile);
router.post('/profile-image', uploadProfileImage, controller.uploadAvatar);

router.post('/resumes', authorize('JOB_SEEKER'), uploadResumeFile, controller.addResume);
router.put('/resumes/:id', authorize('JOB_SEEKER'), uploadResumeFile, controller.replaceResume);
router.patch('/resumes/:id/default', authorize('JOB_SEEKER'), controller.setDefaultResume);
router.delete('/resumes/:id', authorize('JOB_SEEKER'), controller.deleteResume);

export default router;
