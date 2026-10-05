import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  sendSuccess(res, { status: 201, message: 'Account created successfully.', data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  sendSuccess(res, { message: 'Logged in successfully.', data });
});

// JWTs are stateless, so logging out means the client discards the token.
export const logout = asyncHandler(async (req, res) => sendSuccess(res, { message: 'Logged out.' }));

export const me = asyncHandler(async (req, res) => sendSuccess(res, { data: await authService.getCurrentUser(req.user._id) }));

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  sendSuccess(res, { message: 'If an account exists for that email, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, { message: 'Password updated. You can log in now.' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  sendSuccess(res, { message: 'Password changed.' });
});
