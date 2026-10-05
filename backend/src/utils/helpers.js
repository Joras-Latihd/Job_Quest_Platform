import mongoose from 'mongoose';

export const isObjectId = (value) => typeof value === 'string' && mongoose.isValidObjectId(value);

export const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const slugify = (text = '') => String(text).toLowerCase().trim().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const daysAgo = (days) => new Date(Date.now() - days * 86400000);

export const toBool = (value) => value === true || value === 'true';

export const idEquals = (a, b) => Boolean(a && b) && String(a._id || a) === String(b._id || b);
