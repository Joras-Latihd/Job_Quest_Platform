// Errors we throw on purpose. The error middleware turns them into consistent JSON responses.
export default class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message, errors) { return new ApiError(400, message, errors); }
  static unauthorized(message = 'Please log in to continue.') { return new ApiError(401, message); }
  static forbidden(message = 'You do not have permission to perform this action.') { return new ApiError(403, message); }
  static notFound(message = 'Resource not found.') { return new ApiError(404, message); }
  static conflict(message) { return new ApiError(409, message); }
  static validation(message, errors) { return new ApiError(422, message, errors); }
}
