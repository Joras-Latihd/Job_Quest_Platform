import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as companyService from '../services/companyService.js';

export const listCompanies = asyncHandler(async (req, res) => {
  const { companies, pagination } = await companyService.listCompanies(req.query);
  sendSuccess(res, { data: companies, pagination });
});

export const getCompany = asyncHandler(async (req, res) => sendSuccess(res, { data: await companyService.getCompany(req.params.id, req.user) }));
export const myCompany = asyncHandler(async (req, res) => sendSuccess(res, { data: await companyService.getMyCompany(req.user) }));
export const dashboard = asyncHandler(async (req, res) => sendSuccess(res, { data: await companyService.getEmployerDashboard(req.user) }));
export const createCompany = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, message: 'Company profile created.', data: await companyService.createCompany(req.user, req.body, req.files) }));
export const updateCompany = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Company profile updated.', data: await companyService.updateCompany(req.user, req.params.id, req.body, req.files) }));
