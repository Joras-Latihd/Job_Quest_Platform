import { env } from '../config/env.js';

/*
 * Email is not connected yet. Every email in the app goes through sendEmail(),
 * so connecting Nodemailer / Resend / SendGrid later means editing only this file.
 * Until then the message is printed to the console (handy for the password-reset link).
 */
export async function sendEmail({ to, subject, text }) {
  if (!env.isProduction) console.log(`\n[email -> ${to}] ${subject}\n${text}\n`);
  return { queued: false };
}

export const sendPasswordResetEmail = (user, resetUrl) => sendEmail({
  to: user.email,
  subject: 'Reset your Job Quest password',
  text: `Hi ${user.name},\n\nUse this link within one hour to choose a new password:\n${resetUrl}\n\nIf you did not ask for this, you can ignore this email.`,
});
