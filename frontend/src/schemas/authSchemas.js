import { z } from 'zod';

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
const password = z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Za-z]/, 'Include at least one letter').regex(/[0-9]/, 'Include at least one number');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  role: z.enum(['JOB_SEEKER', 'EMPLOYER']),
  name: z.string().trim().min(2, 'Full name is required'),
  email,
  password,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  companyName: z.string().trim().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  phone: z.string().trim().optional(),
}).superRefine((values, ctx) => {
  if (values.password !== values.confirmPassword) {
    ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
  }
  if (values.role === 'EMPLOYER') {
    if (!values.companyName) ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Company name is required' });
    if (!values.industry) ctx.addIssue({ code: 'custom', path: ['industry'], message: 'Select an industry' });
    if (!values.companySize) ctx.addIssue({ code: 'custom', path: ['companySize'], message: 'Select a company size' });
  }
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  password,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: password,
  confirmPassword: z.string().min(1, 'Please confirm the new password'),
}).refine((values) => values.newPassword === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
