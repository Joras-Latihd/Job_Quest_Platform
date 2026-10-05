import { z } from 'zod';

const optionalNumber = z.string().optional().refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), 'Enter a valid number');

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Your name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  subject: z.string().trim().min(3, 'Add a subject'),
  message: z.string().trim().min(10, 'Write at least 10 characters'),
});

export const alertSchema = z.object({
  name: z.string().trim().min(2, 'Give the alert a name'),
  keywords: z.string().trim().min(1, 'Add at least one keyword'),
  location: z.string().optional(),
  category: z.string().optional(),
  jobType: z.string().optional(),
  minSalary: optionalNumber,
  frequency: z.string().min(1),
});

export const reportSchema = z.object({
  reason: z.string().min(1, 'Select a reason'),
  details: z.string().max(500, 'Keep details under 500 characters').optional(),
});

export const interviewSchema = z.object({
  date: z.string().min(1, 'Choose a date'),
  time: z.string().min(1, 'Choose a time'),
  type: z.string().min(1),
  locationOrLink: z.string().trim().min(3, 'Add the address, meeting link or phone number'),
  notes: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Select an industry'),
  description: z.string().trim().min(30, 'Describe the company in at least 30 characters'),
  website: z.string().trim().optional().refine((value) => !value || /^https?:\/\//i.test(value), 'Start with http:// or https://'),
  email: z.string().trim().min(1, 'Company email is required').email('Enter a valid email address'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  location: z.string().min(1, 'Select a location'),
  size: z.string().min(1, 'Select a company size'),
  foundedYear: z.string().optional().refine((value) => !value || (Number(value) >= 1800 && Number(value) <= new Date().getFullYear()), 'Enter a valid year'),
  linkedin: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Choose an icon'),
  status: z.string().min(1),
});

export const locationSchema = z.object({
  city: z.string().trim().min(2, 'City is required'),
  district: z.string().optional(),
  province: z.string().optional(),
  country: z.string().trim().min(2, 'Country is required'),
  status: z.string().min(1),
});

export const broadcastSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  message: z.string().trim().min(5, 'Message is required'),
  audience: z.string().min(1),
});
