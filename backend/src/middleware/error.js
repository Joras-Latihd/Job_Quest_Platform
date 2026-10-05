import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const notFoundHandler = (req, res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// One place that turns every failure into { success: false, message, errors }.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let message = err.message;
  let errors = err.errors || [];

  if (err.name === 'ValidationError' && err.errors && !err.isOperational) {
    status = 422;
    message = 'Validation failed.';
    errors = Object.values(err.errors).map((item) => ({ field: item.path, message: item.message }));
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}.`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = field === 'email' ? 'An account with this email already exists.' : `This ${field} is already in use.`;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'The file is too large.';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = 'The file upload was not accepted.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please log in again.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON.';
  }

  if (status >= 500) {
    console.error(err);
    // Never leak internals in production.
    if (env.isProduction || !err.isOperational) message = 'Something went wrong on our side. Please try again.';
  }

  res.status(status).json({ success: false, message, errors });
}
