import { Router } from 'express';
import * as controller from '../controllers/engagementController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { alertSchema, alertUpdateSchema, contactSchema, interviewSchema, interviewUpdateSchema, reportSchema } from '../validators/miscValidators.js';

export const savedJobRouter = Router();
savedJobRouter.use(protect, authorize('JOB_SEEKER'));
savedJobRouter.get('/', controller.listSavedJobs);
savedJobRouter.post('/:jobId', controller.saveJob);
savedJobRouter.delete('/:jobId', controller.unsaveJob);

export const alertRouter = Router();
alertRouter.use(protect, authorize('JOB_SEEKER'));
alertRouter.get('/', controller.listAlerts);
alertRouter.post('/', validate(alertSchema), controller.createAlert);
alertRouter.put('/:id', validate(alertUpdateSchema), controller.updateAlert);
alertRouter.delete('/:id', controller.deleteAlert);

export const notificationRouter = Router();
notificationRouter.use(protect);
notificationRouter.get('/', controller.listNotifications);
notificationRouter.patch('/read-all', controller.markAllNotificationsRead);
notificationRouter.patch('/:id/read', controller.markNotificationRead);

export const interviewRouter = Router();
interviewRouter.use(protect);
interviewRouter.get('/', authorize('JOB_SEEKER', 'EMPLOYER'), controller.listInterviews);
interviewRouter.post('/', authorize('EMPLOYER'), validate(interviewSchema), controller.scheduleInterview);
interviewRouter.put('/:id', authorize('EMPLOYER'), validate(interviewUpdateSchema), controller.updateInterview);
interviewRouter.delete('/:id', authorize('EMPLOYER'), controller.cancelInterview);

export const reportRouter = Router();
reportRouter.post('/', protect, authorize('JOB_SEEKER', 'EMPLOYER'), validate(reportSchema), controller.createReport);

export const contactRouter = Router();
contactRouter.post('/', contactLimiter, validate(contactSchema), controller.sendContactMessage);

export const articleRouter = Router();
articleRouter.get('/', controller.listArticles);
articleRouter.get('/:slug', controller.getArticle);
