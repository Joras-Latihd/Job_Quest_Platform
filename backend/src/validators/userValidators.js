import { z } from 'zod';
import { JOB_TYPES } from '../constants/index.js';

const optionalText = (max = 200) => z.string().trim().max(max).optional();
const id = z.string().optional();

// Whitelist of profile fields. role, email, isActive etc. are NOT here, so they cannot be changed through this endpoint.
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required').max(100).optional(),
  phone: optionalText(30),
  location: optionalText(100),
  bio: z.string().max(1000).optional(),
  dateOfBirth: z.string().optional(),
  headline: z.string().max(120).optional(),
  currentPosition: optionalText(100),
  yearsOfExperience: z.number().min(0).max(70).optional(),
  expectedSalary: z.number().min(0).optional(),
  preferredLocation: optionalText(100),
  jobTypePreference: z.enum([...JOB_TYPES, '']).optional(),
  skills: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
  education: z.array(z.object({ _id: id, degree: z.string().trim().min(1), institution: z.string().trim().min(1), fieldOfStudy: optionalText(), startDate: z.string().optional(), endDate: z.string().optional(), description: z.string().max(1000).optional() })).max(20).optional(),
  experience: z.array(z.object({ _id: id, company: z.string().trim().min(1), position: z.string().trim().min(1), location: optionalText(), startDate: z.string().optional(), endDate: z.string().optional(), description: z.string().max(1500).optional() })).max(30).optional(),
  languages: z.array(z.object({ _id: id, language: z.string().trim().min(1), proficiency: optionalText(30) })).max(15).optional(),
  certifications: z.array(z.object({ _id: id, name: z.string().trim().min(1), issuer: optionalText(), issueDate: z.string().optional(), url: optionalText(300) })).max(20).optional(),
  projects: z.array(z.object({ _id: id, title: z.string().trim().min(1), url: optionalText(300), description: z.string().max(1000).optional() })).max(20).optional(),
  socialLinks: z.object({ linkedin: optionalText(300), github: optionalText(300), portfolio: optionalText(300), other: optionalText(300) }).optional(),
});
