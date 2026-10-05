import { z } from 'zod';
import { COMPANY_SIZE_LIST } from '../constants/index.js';

// Company forms are multipart, so every value arrives as a string and socialLinks as JSON text.
const parseSocial = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return {}; }
}, z.object({ linkedin: z.string().optional(), facebook: z.string().optional(), twitter: z.string().optional() }).default({}));

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Company name is required').max(150),
  industry: z.string().trim().min(1, 'Industry is required').max(100),
  description: z.string().trim().min(30, 'Describe the company in at least 30 characters').max(5000),
  website: z.string().trim().max(300).refine((value) => !value || /^https?:\/\//i.test(value), 'Website must start with http:// or https://').optional(),
  email: z.string().trim().toLowerCase().email('Enter a valid company email'),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  location: z.string().min(1, 'Location is required'),
  size: z.enum(COMPANY_SIZE_LIST),
  foundedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  socialLinks: parseSocial,
});
