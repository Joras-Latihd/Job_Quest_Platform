import { z } from 'zod';

// Number inputs arrive as strings from the browser, so they are validated as text and converted on submit.
const optionalNumber = z.string().optional().refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), 'Enter a valid number');

export const jobSchema = z.object({
  title: z.string().trim().min(3, 'Job title is required'),
  category: z.string().min(1, 'Select a category'),
  location: z.string().min(1, 'Select a location'),
  workplaceType: z.string().min(1, 'Select a workplace type'),
  jobType: z.string().min(1, 'Select a job type'),
  salaryMin: optionalNumber,
  salaryMax: optionalNumber,
  salaryPeriod: z.string().optional(),
  salaryNegotiable: z.boolean().optional(),
  experienceMin: optionalNumber,
  experienceMax: optionalNumber,
  education: z.string().min(1, 'Select the minimum education'),
  description: z.string().trim().min(30, 'Describe the job in at least 30 characters'),
  responsibilities: z.string().trim().min(1, 'Add at least one responsibility'),
  requirements: z.string().trim().min(1, 'Add at least one requirement'),
  qualifications: z.string().optional(),
  skills: z.string().trim().min(1, 'Add at least one skill'),
  benefits: z.string().optional(),
  deadline: z.string().min(1, 'Application deadline is required'),
  vacancyCount: z.string().refine((value) => Number(value) >= 1, 'At least 1 vacancy'),
  applicationMethod: z.string().min(1),
  applicationUrl: z.string().trim().optional(),
  isUrgent: z.boolean().optional(),
  requestFeatured: z.boolean().optional(),
  questions: z.array(z.object({ question: z.string().trim().min(3, 'Write the question') })).optional(),
}).superRefine((values, ctx) => {
  if (values.salaryMin && values.salaryMax && Number(values.salaryMin) > Number(values.salaryMax)) {
    ctx.addIssue({ code: 'custom', path: ['salaryMax'], message: 'Maximum must be higher than minimum' });
  }
  if (values.experienceMin && values.experienceMax && Number(values.experienceMin) > Number(values.experienceMax)) {
    ctx.addIssue({ code: 'custom', path: ['experienceMax'], message: 'Maximum must be higher than minimum' });
  }
  if (values.applicationMethod !== 'PLATFORM' && !values.applicationUrl) {
    ctx.addIssue({ code: 'custom', path: ['applicationUrl'], message: 'Enter the email address or link applicants should use' });
  }
});
