import { z } from 'zod';

const optionalUrl = z.string().trim().optional().refine((value) => !value || /^https?:\/\//i.test(value), 'Start with http:// or https://');
const text = (message) => z.string().trim().min(1, message);

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  bio: z.string().max(1000, 'Keep your bio under 1000 characters').optional(),
  dateOfBirth: z.string().optional(), // optional by design
  headline: z.string().max(120, 'Keep it under 120 characters').optional(),
  currentPosition: z.string().optional(),
  yearsOfExperience: z.union([z.string(), z.number()]).optional(),
  expectedSalary: z.union([z.string(), z.number()]).optional(),
  preferredLocation: z.string().optional(),
  jobTypePreference: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.object({
    degree: text('Degree is required'), institution: text('Institution is required'), fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(), endDate: z.string().optional(), description: z.string().optional(),
  })).optional(),
  experience: z.array(z.object({
    company: text('Company is required'), position: text('Position is required'), location: z.string().optional(),
    startDate: z.string().optional(), endDate: z.string().optional(), description: z.string().optional(),
  })).optional(),
  languages: z.array(z.object({ language: text('Language is required'), proficiency: z.string().optional() })).optional(),
  certifications: z.array(z.object({ name: text('Certification name is required'), issuer: z.string().optional(), issueDate: z.string().optional(), url: optionalUrl })).optional(),
  projects: z.array(z.object({ title: text('Project title is required'), url: optionalUrl, description: z.string().optional() })).optional(),
  socialLinks: z.object({ linkedin: optionalUrl, github: optionalUrl, portfolio: optionalUrl, other: optionalUrl }).optional(),
});
