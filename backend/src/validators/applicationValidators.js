import { z } from 'zod';
import { APPLICATION_STATUS_LIST } from '../constants/index.js';

export const applySchema = z.object({
  job: z.string().min(1),
  resume: z.string().min(1, 'Choose a resume'),
  coverLetter: z.string().max(3000).optional().default(''),
  answers: z.array(z.object({ question: z.string(), answer: z.string().max(2000).default('') })).max(10).default([]),
});

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUS_LIST).refine((value) => value !== 'WITHDRAWN', 'Only the candidate can withdraw an application'),
  note: z.string().trim().max(500).optional(),
});
