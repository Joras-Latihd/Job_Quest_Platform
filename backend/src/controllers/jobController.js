import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as jobService from '../services/jobService.js';
import { getSettings } from '../services/settingsService.js';
import { logAction } from '../services/auditService.js';

export const listJobs = asyncHandler(async (req, res) => {
  const { jobs, pagination } = await jobService.listPublicJobs(req.query, req.user);
  sendSuccess(res, { data: jobs, pagination });
});

export const getJob = asyncHandler(async (req, res) => sendSuccess(res, { data: await jobService.getJobDetails(req.params.id, req.user) }));
export const relatedJobs = asyncHandler(async (req, res) => sendSuccess(res, { data: await jobService.getRelatedJobs(req.params.id) }));
export const recommendedJobs = asyncHandler(async (req, res) => sendSuccess(res, { data: await jobService.getRecommendedJobs(req.user) }));
export const popularSearches = asyncHandler(async (req, res) => sendSuccess(res, { data: (await getSettings()).popularSearches }));
export const platformStats = asyncHandler(async (req, res) => sendSuccess(res, { data: await jobService.getPlatformStats() }));

export const myJobs = asyncHandler(async (req, res) => {
  const { jobs, pagination } = await jobService.listEmployerJobs(req.user, req.query);
  sendSuccess(res, { data: jobs, pagination });
});

export const createJob = asyncHandler(async (req, res) => {
  const { job, message } = await jobService.createJob(req.user, req.body);
  sendSuccess(res, { status: 201, message, data: job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const { job, message } = await jobService.updateJob(req.user, req.params.id, req.body);
  if (req.user.role === 'ADMIN') await logAction(req.user, 'JOB_EDITED', { targetType: 'Job', targetId: job._id, targetLabel: job.title });
  sendSuccess(res, { message, data: job });
});

export const duplicateJob = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, message: 'Job duplicated as a draft.', data: await jobService.duplicateJob(req.user, req.params.id) }));

export const changeStatus = asyncHandler(async (req, res) => {
  const job = await jobService.changeJobStatus(req.user, req.params.id, req.body);
  if (req.user.role === 'ADMIN') await logAction(req.user, 'JOB_STATUS_CHANGED', { targetType: 'Job', targetId: job._id, targetLabel: job.title, details: `Set to ${job.status}` });
  sendSuccess(res, { message: 'Job status updated.', data: job });
});

export const featureJob = asyncHandler(async (req, res) => {
  const job = await jobService.setFeatured(req.params.id, req.body.isFeatured);
  await logAction(req.user, req.body.isFeatured ? 'JOB_FEATURED' : 'JOB_UNFEATURED', { targetType: 'Job', targetId: job._id, targetLabel: job.title });
  sendSuccess(res, { message: 'Featured status updated.', data: job });
});

export const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.user, req.params.id);
  if (req.user.role === 'ADMIN') await logAction(req.user, 'JOB_DELETED', { targetType: 'Job', targetId: req.params.id });
  sendSuccess(res, { message: 'Job deleted.' });
});
