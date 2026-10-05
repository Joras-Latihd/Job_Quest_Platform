import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import ApiError from '../utils/ApiError.js';
import { getSettings } from './settingsService.js';
import { sendPasswordResetEmail } from './emailService.js';
import { notify } from './notificationService.js';

export const signToken = (userId) => jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const withCompany = (userId) => User.findById(userId).populate('company', 'name logo verificationStatus');

export async function registerUser(body) {
  const settings = await getSettings();
  if (!settings.allowRegistrations) throw ApiError.forbidden('New registrations are currently closed.');
  if (await User.exists({ email: body.email })) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({ name: body.name, email: body.email, password: body.password, role: body.role, phone: body.phone });

  if (body.role === 'EMPLOYER') {
    // Employers get a pending company right away; an admin verifies it later.
    const company = await Company.create({ owner: user._id, name: body.companyName, industry: body.industry, size: body.companySize || undefined, email: user.email, phone: body.phone });
    user.company = company._id;
    await user.save();
    const admins = await User.find({ role: 'ADMIN', isActive: true }).select('_id');
    await Promise.all(admins.map((admin) => notify(admin._id, { type: 'EMPLOYER_PENDING', title: 'New employer to verify', message: `${company.name} registered and is waiting for verification.`, link: '/admin/employers' })));
  }
  await notify(user._id, { type: 'WELCOME', title: 'Welcome to Job Quest', message: body.role === 'EMPLOYER' ? 'Complete your company profile so we can verify it.' : 'Complete your profile to get better job recommendations.', link: body.role === 'EMPLOYER' ? '/employer/company' : '/dashboard/profile' });
  return { token: signToken(user._id), user: await withCompany(user._id) };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password so attackers cannot discover which emails exist.
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Incorrect email or password.');
  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  return { token: signToken(user._id), user: await withCompany(user._id) };
}

export const getCurrentUser = (userId) => withCompany(userId);

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email, isActive: true });
  if (!user) return; // respond the same way either way
  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  await sendPasswordResetEmail(user, `${env.clientUrl.split(',')[0]}/reset-password/${rawToken}`);
}

export async function resetPassword({ token, password }) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } }).select('+password +passwordResetToken +passwordResetExpires');
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired.');
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw ApiError.badRequest('Your current password is incorrect.');
  user.password = newPassword;
  user.$locals.keepSession = true;
  await user.save();
}
