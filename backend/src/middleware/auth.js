import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
};

async function loadUser(token) {
  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) return null;
  // A password change invalidates tokens issued before it.
  if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) return null;
  return user;
}

// Requires a valid token. Sets req.user.
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  let user;
  try {
    user = await loadUser(token);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please log in again.');
  }
  if (!user) throw ApiError.unauthorized('Your session is no longer valid. Please log in again.');
  req.user = user;
  next();
});

// Public routes that return extra data (saved/applied flags) when a valid token is sent.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = (await loadUser(token)) || undefined;
    } catch {
      req.user = undefined;
    }
  }
  next();
});

// Role check. Always used after `protect`.
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  return next();
};
