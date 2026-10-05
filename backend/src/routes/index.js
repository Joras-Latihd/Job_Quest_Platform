import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import jobRoutes from './jobRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import companyRoutes from './companyRoutes.js';
import adminRoutes from './adminRoutes.js';
import { categoryRouter, locationRouter } from './metaRoutes.js';
import { alertRouter, articleRouter, contactRouter, interviewRouter, notificationRouter, reportRouter, savedJobRouter } from './engagementRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'Job Quest API is running.' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);
router.use('/categories', categoryRouter);
router.use('/locations', locationRouter);
router.use('/saved-jobs', savedJobRouter);
router.use('/job-alerts', alertRouter);
router.use('/notifications', notificationRouter);
router.use('/interviews', interviewRouter);
router.use('/reports', reportRouter);
router.use('/contact', contactRouter);
router.use('/articles', articleRouter);
router.use('/admin', adminRoutes);

export default router;
