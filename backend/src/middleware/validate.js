import ApiError from '../utils/ApiError.js';

/*
 * validate(zodSchema) checks req.body and replaces it with the parsed result.
 * Unknown fields are dropped, which also protects against mass assignment
 * (for example someone sending { role: "ADMIN" } to a profile update).
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
    return next(ApiError.validation(errors[0]?.message || 'Validation failed.', errors));
  }
  req.body = result.data;
  return next();
};
