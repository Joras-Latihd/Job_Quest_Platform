import rateLimit from 'express-rate-limit';

const make = (windowMinutes, max, message) => rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message, errors: [] }),
});

export const apiLimiter = make(15, 1000, 'Too many requests. Please slow down and try again shortly.');
export const authLimiter = make(15, 30, 'Too many attempts. Please wait a few minutes and try again.');
export const contactLimiter = make(60, 10, 'You have sent too many messages. Please try again later.');
