import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_LIST, JOB_TYPES } from '../constants/index.js';

const { Schema } = mongoose;

// Embedded sub-documents: these only make sense as part of one user, so they do not need their own collections.
const educationSchema = new Schema({ degree: { type: String, required: true, trim: true }, institution: { type: String, required: true, trim: true }, fieldOfStudy: String, startDate: Date, endDate: Date, description: String });
const experienceSchema = new Schema({ company: { type: String, required: true, trim: true }, position: { type: String, required: true, trim: true }, location: String, startDate: Date, endDate: Date, description: String });
const languageSchema = new Schema({ language: { type: String, required: true, trim: true }, proficiency: String });
const certificationSchema = new Schema({ name: { type: String, required: true, trim: true }, issuer: String, issueDate: Date, url: String });
const projectSchema = new Schema({ title: { type: String, required: true, trim: true }, url: String, description: String });
const resumeSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: String,
  size: Number,
  mimeType: String,
  isDefault: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
});

const userSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ROLE_LIST, default: 'JOB_SEEKER', index: true },
  phone: { type: String, trim: true },
  profileImage: String,
  profileImagePublicId: String,
  location: { type: String, trim: true },
  bio: { type: String, maxlength: 1000 },
  dateOfBirth: Date,
  headline: { type: String, maxlength: 120 },
  currentPosition: String,
  yearsOfExperience: { type: Number, min: 0 },
  expectedSalary: { type: Number, min: 0 },
  preferredLocation: String,
  jobTypePreference: { type: String, enum: [...JOB_TYPES, ''] },
  skills: [{ type: String, trim: true }],
  education: [educationSchema],
  experience: [experienceSchema],
  languages: [languageSchema],
  certifications: [certificationSchema],
  projects: [projectSchema],
  socialLinks: { linkedin: String, github: String, portfolio: String, other: String },
  resumes: [resumeSchema],
  company: { type: Schema.Types.ObjectId, ref: 'Company' }, // employers only
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  passwordChangedAt: Date,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // Tokens issued before this moment stop working (1s margin for clock rounding).
  // "Change password" keeps the current session alive ($locals.keepSession); "reset password" signs everyone out.
  if (!this.isNew && !this.$locals.keepSession) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex'); // only the hash is stored
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  return rawToken;
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
