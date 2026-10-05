import { z } from 'zod';
import { APPLICATION_METHODS, EDUCATION_LEVELS, JOB_STATUS_LIST, JOB_TYPES, SALARY_PERIODS, WORKPLACE_TYPES } from '../constants/index.js';

const lines = z.array(z.string().trim().min(1).max(500)).max(30).default([]);

export const jobSchema = z.object({
  title: z.string().trim().min(3, 'Job title is required').max(150),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  workplaceType: z.enum(WORKPLACE_TYPES),
  jobType: z.enum(JOB_TYPES),
  salary: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().trim().max(5).default('NPR'),
    period: z.enum(SALARY_PERIODS).default('MONTHLY'),
    negotiable: z.boolean().default(false),
  }).default({}),
  experience: z.object({ min: z.number().min(0).default(0), max: z.number().min(0).optional() }).default({}),
  education: z.enum(EDUCATION_LEVELS),
  description: z.string().trim().min(30, 'Describe the job in at least 30 characters').max(10000),
  responsibilities: lines,
  requirements: lines,
  qualifications: lines,
  benefits: lines,
  skills: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  // The deadline is valid through the end of the chosen day.
  deadline: z.coerce.date().transform((date) => { date.setUTCHours(23, 59, 59, 999); return date; }),
  vacancyCount: z.number().int().min(1).max(10000).default(1),
  applicationMethod: z.enum(APPLICATION_METHODS).default('PLATFORM'),
  applicationUrl: z.string().trim().max(300).optional(),
  screeningQuestions: z.array(z.object({ question: z.string().trim().min(3).max(300), required: z.boolean().default(true) })).max(10).default([]),
  isUrgent: z.boolean().default(false),
  featureRequested: z.boolean().default(false),
  submitAction: z.enum(['draft', 'submit']).default('submit'),
}).superRefine((values, ctx) => {
  if (values.salary.min != null && values.salary.max != null && values.salary.min > values.salary.max) {
    ctx.addIssue({ code: 'custom', path: ['salary', 'max'], message: 'Maximum salary must be higher than minimum' });
  }
  if (values.experience.max != null && values.experience.min > values.experience.max) {
    ctx.addIssue({ code: 'custom', path: ['experience', 'max'], message: 'Maximum experience must be higher than minimum' });
  }
  if (values.applicationMethod !== 'PLATFORM' && !values.applicationUrl) {
    ctx.addIssue({ code: 'custom', path: ['applicationUrl'], message: 'Enter the email address or link applicants should use' });
  }
});

export const jobStatusSchema = z.object({ status: z.enum(JOB_STATUS_LIST), reason: z.string().trim().max(500).optional() });
export const jobFeatureSchema = z.object({ isFeatured: z.boolean() });
export const rejectJobSchema = z.object({ reason: z.string().trim().min(5, 'Please give a reason').max(500) });
