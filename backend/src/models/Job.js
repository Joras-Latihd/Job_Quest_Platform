import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { APPLICATION_METHODS, EDUCATION_LEVELS, JOB_STATUS_LIST, JOB_TYPES, SALARY_PERIODS, WORKPLACE_TYPES } from '../constants/index.js';
import { slugify } from '../utils/helpers.js';

const { Schema } = mongoose;

const jobSchema = new Schema({
  title: { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 150 },
  slug: { type: String, index: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  workplaceType: { type: String, enum: WORKPLACE_TYPES, default: 'ON_SITE' },
  jobType: { type: String, enum: JOB_TYPES, default: 'FULL_TIME' },
  description: { type: String, required: true, maxlength: 10000 },
  responsibilities: [String],
  requirements: [String],
  qualifications: [String],
  skills: [{ type: String, trim: true }],
  benefits: [String],
  salary: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'NPR' },
    period: { type: String, enum: SALARY_PERIODS, default: 'MONTHLY' },
    negotiable: { type: Boolean, default: false },
  },
  experience: { min: { type: Number, default: 0, min: 0 }, max: { type: Number, min: 0 } },
  education: { type: String, enum: EDUCATION_LEVELS, default: 'BACHELOR' },
  vacancyCount: { type: Number, default: 1, min: 1 },
  deadline: { type: Date, required: true },
  applicationMethod: { type: String, enum: APPLICATION_METHODS, default: 'PLATFORM' },
  applicationUrl: String, // email address or link when applicationMethod is not PLATFORM
  screeningQuestions: [{ question: { type: String, required: true, trim: true }, required: { type: Boolean, default: true } }],
  status: { type: String, enum: JOB_STATUS_LIST, default: 'DRAFT' },
  rejectionReason: String,
  isFeatured: { type: Boolean, default: false },
  featureRequested: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 }, // kept in sync when people apply or withdraw
  publishedAt: Date,
  expiryNoticeSent: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes follow the queries the app actually runs: public search, company pages, employer lists, filters.
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ title: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ skills: 1 });

jobSchema.pre('save', function makeSlug() {
  if (this.isNew || this.isModified('title')) this.slug = `${slugify(this.title)}-${crypto.randomBytes(3).toString('hex')}`;
});

export default mongoose.model('Job', jobSchema);
