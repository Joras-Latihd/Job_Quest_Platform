// Lets controllers be async without try/catch: rejected promises go to the error middleware.
export default (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
