import { Router } from 'express';
import * as controller from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rejectJobSchema } from '../validators/jobValidators.js';
import {
  adminUserUpdateSchema, articleSchema, broadcastSchema, employerStatusSchema, messageUpdateSchema, reportUpdateSchema, settingsSchema,
} from '../validators/miscValidators.js';

const router = Router();

// Every admin endpoint requires a logged-in ADMIN. A job seeker or employer gets 403 here.
router.use(protect, authorize('ADMIN'));

router.get('/dashboard', controller.dashboard);

router.get('/users', controller.listUsers);
router.patch('/users/:id', validate(adminUserUpdateSchema), controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

router.get('/employers', controller.listEmployers);
router.patch('/employers/:id/verify', validate(employerStatusSchema), controller.setEmployerStatus);
router.get('/companies', controller.listCompanies);

router.get('/jobs', controller.listJobs);
router.patch('/jobs/:id/approve', controller.approveJob);
router.patch('/jobs/:id/reject', validate(rejectJobSchema), controller.rejectJob);
router.get('/applications', controller.listApplications);

router.get('/reports', controller.listReports);
router.patch('/reports/:id', validate(reportUpdateSchema), controller.updateReport);
router.get('/messages', controller.listMessages);
router.patch('/messages/:id', validate(messageUpdateSchema), controller.updateMessage);

router.get('/notifications', controller.listBroadcasts);
router.post('/notifications', validate(broadcastSchema), controller.broadcast);
router.get('/settings', controller.getSettingsHandler);
router.put('/settings', validate(settingsSchema), controller.updateSettingsHandler);
router.get('/audit-logs', controller.listAuditLogs);

router.get('/articles', controller.listAdminArticles);
router.post('/articles', validate(articleSchema), controller.createArticle);
router.put('/articles/:id', validate(articleSchema.partial()), controller.updateArticle);
router.delete('/articles/:id', controller.deleteArticle);

export default router;
