import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address');
const password = z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Za-z]/, 'Password needs at least one letter').regex(/[0-9]/, 'Password needs at least one number').max(128);

export const registerSchema = z.object({
  role: z.enum(['JOB_SEEKER', 'EMPLOYER']), // ADMIN can never be self-registered
  name: z.string().trim().min(2, 'Full name is required').max(100),
  email,
  password,
  companyName: z.string().trim().max(150).optional(),
  industry: z.string().trim().max(100).optional(),
  companySize: z.string().trim().optional(),
  phone: z.string().trim().max(30).optional(),
}).superRefine((values, ctx) => {
  if (values.role === 'EMPLOYER' && !values.companyName) ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Company name is required for employers' });
});

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ token: z.string().min(10, 'Reset link is invalid'), password });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1, 'Current password is required'), newPassword: password });
