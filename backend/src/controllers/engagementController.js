import SavedJob from '../models/SavedJob.js';
import JobAlert from '../models/JobAlert.js';
import Notification from '../models/Notification.js';
import JobReport from '../models/JobReport.js';
import ContactMessage from '../models/ContactMessage.js';
import Article from '../models/Article.js';
import Job from '../models/Job.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { buildPagination, getPagination } from '../utils/pagination.js';
import * as interviewService from '../services/interviewService.js';
import { JOB_POPULATE } from '../services/jobService.js';
import { notifyMany } from '../services/notificationService.js';
import User from '../models/User.js';

// ---------- saved jobs ----------
export const saveJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, status: 'PUBLISHED' }).select('_id');
  if (!job) throw ApiError.notFound('This job is not available to save.');
  await SavedJob.updateOne({ user: req.user._id, job: job._id }, { $setOnInsert: { savedAt: new Date() } }, { upsert: true }); // saving twice is harmless
  sendSuccess(res, { status: 201, message: 'Job saved.' });
});

export const unsaveJob = asyncHandler(async (req, res) => {
  await SavedJob.deleteOne({ user: req.user._id, job: req.params.jobId });
  sendSuccess(res, { message: 'Removed from saved jobs.' });
});

export const listSavedJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    SavedJob.find({ user: req.user._id }).sort({ savedAt: -1 }).skip(skip).limit(limit).populate({ path: 'job', populate: JOB_POPULATE }).lean(),
    SavedJob.countDocuments({ user: req.user._id }),
  ]);
  sendSuccess(res, { data: items.filter((item) => item.job), pagination: buildPagination(page, limit, total) });
});

// ---------- job alerts ----------
export const listAlerts = asyncHandler(async (req, res) => sendSuccess(res, { data: await JobAlert.find({ user: req.user._id }).sort({ createdAt: -1 }) }));

export const createAlert = asyncHandler(async (req, res) => {
  if ((await JobAlert.countDocuments({ user: req.user._id })) >= 10) throw ApiError.badRequest('You can have up to 10 job alerts.');
  const alert = await JobAlert.create({ ...req.body, category: req.body.category || undefined, user: req.user._id });
  sendSuccess(res, { status: 201, message: 'Job alert saved.', data: alert });
});

export const updateAlert = asyncHandler(async (req, res) => {
  const alert = await JobAlert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) throw ApiError.notFound('Alert not found.');
  alert.set({ ...req.body, ...(req.body.category === '' ? { category: undefined } : {}) });
  await alert.save();
  sendSuccess(res, { message: 'Job alert saved.', data: alert });
});

export const deleteAlert = asyncHandler(async (req, res) => {
  const result = await JobAlert.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) throw ApiError.notFound('Alert not found.');
  sendSuccess(res, { message: 'Alert deleted.' });
});

// ---------- notifications ----------
export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { user: req.user._id };
  const [data, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  sendSuccess(res, { data, unreadCount, pagination: buildPagination(page, limit, total) });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { isRead: true });
  sendSuccess(res, { message: 'Marked as read.' });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendSuccess(res, { message: 'All notifications marked as read.' });
});

// ---------- interviews ----------
export const listInterviews = asyncHandler(async (req, res) => sendSuccess(res, { data: await interviewService.listMyInterviews(req.user) }));
export const scheduleInterview = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, message: 'Interview scheduled.', data: await interviewService.scheduleInterview(req.user, req.body) }));
export const updateInterview = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Interview updated.', data: await interviewService.updateInterview(req.user, req.params.id, req.body) }));
export const cancelInterview = asyncHandler(async (req, res) => {
  await interviewService.cancelInterview(req.user, req.params.id);
  sendSuccess(res, { message: 'Interview cancelled.' });
});

// ---------- reports ----------
export const createReport = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.body.job).select('title postedBy');
  if (!job) throw ApiError.notFound('Job not found.');
  if (String(job.postedBy) === String(req.user._id)) throw ApiError.badRequest('You cannot report your own job.');
  if (await JobReport.exists({ job: job._id, reporter: req.user._id, status: 'PENDING' })) throw ApiError.conflict('You have already reported this job. Our team is reviewing it.');
  const report = await JobReport.create({ ...req.body, reporter: req.user._id });
  const admins = await User.find({ role: 'ADMIN', isActive: true }).distinct('_id');
  await notifyMany(admins, { type: 'JOB_REPORTED', title: 'Job reported', message: `"${job.title}" was reported.`, link: '/admin/reports' });
  sendSuccess(res, { status: 201, message: 'Thanks. Our team will review this listing.', data: report });
});

// ---------- contact + articles ----------
export const sendContactMessage = asyncHandler(async (req, res) => {
  await ContactMessage.create(req.body);
  sendSuccess(res, { status: 201, message: 'Message sent. We will get back to you soon.' });
});

export const listArticles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12, maxLimit: 30 });
  const filter = { status: 'PUBLISHED' };
  const [data, total] = await Promise.all([
    Article.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).select('-content').populate('author', 'name').lean(),
    Article.countDocuments(filter),
  ]);
  sendSuccess(res, { data, pagination: buildPagination(page, limit, total) });
});

export const getArticle = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug, status: 'PUBLISHED' }).populate('author', 'name');
  if (!article) throw ApiError.notFound('Article not found.');
  sendSuccess(res, { data: article });
});
