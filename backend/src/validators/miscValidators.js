import { z } from 'zod';
import { ALERT_FREQUENCY_LIST, INTERVIEW_TYPE_LIST, JOB_TYPES, REPORT_REASON_LIST, REPORT_STATUS_LIST, ROLE_LIST } from '../constants/index.js';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(3000),
});

export const reportSchema = z.object({
  job: z.string().min(1),
  reason: z.enum(REPORT_REASON_LIST),
  details: z.string().trim().max(500).optional(),
});

export const interviewSchema = z.object({
  application: z.string().min(1),
  scheduledAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), 'Choose a time in the future'),
  type: z.enum(INTERVIEW_TYPE_LIST),
  locationOrLink: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(500).optional(),
});

export const interviewUpdateSchema = interviewSchema.omit({ application: true }).partial();

const alertShape = {
  name: z.string().trim().min(2).max(80),
  keywords: z.string().trim().min(1).max(150),
  location: z.string().trim().max(100).optional(),
  category: z.string().optional(),
  jobType: z.enum([...JOB_TYPES, '']).optional(),
  minSalary: z.number().min(0).optional(),
  frequency: z.enum(ALERT_FREQUENCY_LIST).default('DAILY'),
};
export const alertSchema = z.object(alertShape);
export const alertUpdateSchema = z.object({ ...alertShape, isActive: z.boolean() }).partial();

const status = z.enum(['active', 'inactive']);
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  icon: z.string().trim().max(40).optional(),
  status: status.optional(),
});
export const categoryUpdateSchema = categorySchema.partial();

export const locationSchema = z.object({
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().max(80).optional(),
  province: z.string().trim().max(80).optional(),
  country: z.string().trim().min(2).max(80).default('Nepal'),
  status: status.optional(),
});
export const locationUpdateSchema = locationSchema.partial();

export const adminUserUpdateSchema = z.object({ isActive: z.boolean().optional(), role: z.enum(ROLE_LIST).optional() });
export const employerStatusSchema = z.object({
  status: z.enum(['VERIFIED', 'PENDING', 'SUSPENDED', 'REJECTED']),
  reason: z.string().trim().max(500).optional(),
}).superRefine((values, ctx) => {
  if (['REJECTED', 'SUSPENDED'].includes(values.status) && !values.reason) ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required' });
});
export const reportUpdateSchema = z.object({ status: z.enum(REPORT_STATUS_LIST) });
export const messageUpdateSchema = z.object({ isRead: z.boolean() });
export const broadcastSchema = z.object({
  title: z.string().trim().min(3).max(100),
  message: z.string().trim().min(5).max(500),
  audience: z.enum(['ALL', 'JOB_SEEKER', 'EMPLOYER']).default('ALL'),
});
export const settingsSchema = z.object({
  requireJobApproval: z.boolean().optional(),
  requireEmployerVerification: z.boolean().optional(),
  allowRegistrations: z.boolean().optional(),
  popularSearches: z.array(z.string().trim().min(1).max(60)).max(12).optional(),
});

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(150),
  content: z.string().trim().min(20),
  category: z.string().trim().max(60).optional(),
  thumbnail: z.string().trim().max(300).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});
