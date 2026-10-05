import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as userService from '../services/userService.js';

export const dashboard = asyncHandler(async (req, res) => sendSuccess(res, { data: await userService.getSeekerDashboard(req.user) }));
export const updateProfile = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Profile saved.', data: await userService.updateProfile(req.user, req.body) }));
export const uploadAvatar = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Photo updated.', data: await userService.setProfileImage(req.user, req.file) }));
export const addResume = asyncHandler(async (req, res) => sendSuccess(res, { status: 201, message: 'Resume uploaded.', data: await userService.addResume(req.user, req.file) }));
export const replaceResume = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Resume replaced.', data: await userService.replaceResume(req.user, req.params.id, req.file) }));
export const setDefaultResume = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Default resume updated.', data: await userService.setDefaultResume(req.user, req.params.id) }));
export const deleteResume = asyncHandler(async (req, res) => {
  await userService.deleteResume(req.user, req.params.id);
  sendSuccess(res, { message: 'Resume deleted.' });
});
