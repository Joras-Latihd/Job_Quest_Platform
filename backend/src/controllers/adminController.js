import JobReport from '../models/JobReport.js';
import ContactMessage from '../models/ContactMessage.js';
import Article from '../models/Article.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import * as adminService from '../services/adminService.js';
import { deleteUserCascade } from '../services/userService.js';
import { getSettings, updateSettings } from '../services/settingsService.js';
import { logAction } from '../services/auditService.js';

const list = (fetcher) => asyncHandler(async (req, res) => {
  const { rows, pagination } = await fetcher(req.query);
  sendSuccess(res, { data: rows, pagination });
});

export const dashboard = asyncHandler(async (req, res) => sendSuccess(res, { data: await adminService.getDashboard() }));

export const listUsers = list(adminService.listUsers);
export const listEmployers = list(adminService.listEmployers);
export const listCompanies = list(adminService.listCompanies);
export const listJobs = list(adminService.listJobs);
export const listApplications = list(adminService.listApplications);
export const listReports = list(adminService.listReports);
export const listMessages = list(adminService.listMessages);
export const listBroadcasts = list(adminService.listBroadcasts);
export const listAuditLogs = list(adminService.listAuditLogs);

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.user, req.params.id, req.body);
  await logAction(req.user, 'USER_UPDATED', { targetType: 'User', targetId: user._id, targetLabel: user.email, details: JSON.stringify(req.body) });
  sendSuccess(res, { message: 'Account updated.', data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await adminService.getUserForDeletion(req.user, req.params.id);
  await deleteUserCascade(user);
  await logAction(req.user, 'USER_DELETED', { targetType: 'User', targetId: user._id, targetLabel: user.email });
  sendSuccess(res, { message: 'User deleted.' });
});

export const setEmployerStatus = asyncHandler(async (req, res) => {
  const { employer, company } = await adminService.setEmployerStatus(req.params.id, req.body);
  await logAction(req.user, 'EMPLOYER_STATUS', { targetType: 'Company', targetId: company._id, targetLabel: company.name, details: req.body.status });
  sendSuccess(res, { message: 'Employer status updated.', data: { employer, company } });
});

export const approveJob = asyncHandler(async (req, res) => {
  const job = await adminService.approveJob(req.params.id);
  await logAction(req.user, 'JOB_APPROVED', { targetType: 'Job', targetId: job._id, targetLabel: job.title });
  sendSuccess(res, { message: 'Job approved and published.', data: job });
});

export const rejectJob = asyncHandler(async (req, res) => {
  const job = await adminService.rejectJob(req.params.id, req.body.reason);
  await logAction(req.user, 'JOB_REJECTED', { targetType: 'Job', targetId: job._id, targetLabel: job.title, details: req.body.reason });
  sendSuccess(res, { message: 'Job rejected. The employer has been notified.', data: job });
});

export const updateReport = asyncHandler(async (req, res) => {
  const report = await JobReport.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!report) throw ApiError.notFound('Report not found.');
  await logAction(req.user, 'REPORT_UPDATED', { targetType: 'JobReport', targetId: report._id, details: report.status });
  sendSuccess(res, { message: 'Report updated.', data: report });
});

export const updateMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead }, { new: true });
  if (!message) throw ApiError.notFound('Message not found.');
  sendSuccess(res, { data: message });
});

export const broadcast = asyncHandler(async (req, res) => {
  const record = await adminService.sendBroadcast(req.user, req.body);
  await logAction(req.user, 'BROADCAST_SENT', { targetType: 'Broadcast', targetId: record._id, targetLabel: record.title, details: `${record.recipients} recipients` });
  sendSuccess(res, { status: 201, message: `Notification sent to ${record.recipients} user${record.recipients === 1 ? '' : 's'}.`, data: record });
});

export const getSettingsHandler = asyncHandler(async (req, res) => sendSuccess(res, { data: await getSettings() }));
export const updateSettingsHandler = asyncHandler(async (req, res) => {
  const settings = await updateSettings(req.body);
  await logAction(req.user, 'SETTINGS_UPDATED', { targetType: 'Setting', details: JSON.stringify(req.body) });
  sendSuccess(res, { message: 'Settings saved.', data: settings });
});

// ---------- articles (admin-managed career resources; no admin page yet, API is ready) ----------
export const listAdminArticles = asyncHandler(async (req, res) => sendSuccess(res, { data: await Article.find().sort({ createdAt: -1 }).populate('author', 'name') }));
export const createArticle = asyncHandler(async (req, res) => {
  const article = await Article.create({ ...req.body, author: req.user._id, publishedAt: req.body.status === 'PUBLISHED' ? new Date() : undefined });
  sendSuccess(res, { status: 201, message: 'Article created.', data: article });
});
export const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw ApiError.notFound('Article not found.');
  article.set(req.body);
  if (article.status === 'PUBLISHED' && !article.publishedAt) article.publishedAt = new Date();
  await article.save();
  sendSuccess(res, { message: 'Article updated.', data: article });
});
export const deleteArticle = asyncHandler(async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  sendSuccess(res, { message: 'Article deleted.' });
});

