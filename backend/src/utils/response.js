// Every success response has the same envelope: { success, message, data, pagination?, ...extra }
export function sendSuccess(res, { status = 200, message, data, pagination, ...extra } = {}) {
  const body = { success: true, message, data, pagination, ...extra };
  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
  return res.status(status).json(body);
}
