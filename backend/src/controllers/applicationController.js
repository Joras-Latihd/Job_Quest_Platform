import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as applicationService from '../services/applicationService.js';

export const apply = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, message: 'Application submitted successfully.', data: await applicationService.applyToJob(req.user, req.body) }));

export const myApplications = asyncHandler(async (req, res) => {
  const { applications, pagination } = await applicationService.listMyApplications(req.user, req.query);
  sendSuccess(res, { data: applications, pagination });
});

export const jobApplications = asyncHandler(async (req, res) => {
  const { applications, pagination } = await applicationService.listApplicationsForJob(req.user, req.params.jobId, req.query);
  sendSuccess(res, { data: applications, pagination });
});

export const employerApplications = asyncHandler(async (req, res) => {
  const { applications, pagination } = await applicationService.listApplicationsForEmployer(req.user, req.query);
  sendSuccess(res, { data: applications, pagination });
});

export const getApplication = asyncHandler(async (req, res) => sendSuccess(res, { data: await applicationService.getApplication(req.user, req.params.id) }));
export const updateStatus = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Application status updated.', data: await applicationService.updateApplicationStatus(req.user, req.params.id, req.body) }));
export const withdraw = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Application withdrawn.', data: await applicationService.withdrawApplication(req.user, req.params.id) }));
