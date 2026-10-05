import mongoose from 'mongoose';
import { APPLICATION_STATUS_LIST } from '../constants/index.js';

const { Schema } = mongoose;

const applicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // A copy of the resume at the time of applying, so deleting it from the profile does not break the employer's link.
  resume: { name: String, url: String, mimeType: String },
  coverLetter: { type: String, maxlength: 3000 },
  answers: [{ question: String, answer: String }],
  status: { type: String, enum: APPLICATION_STATUS_LIST, default: 'APPLIED' },
  statusHistory: [{
    status: { type: String, enum: APPLICATION_STATUS_LIST },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String,
  }],
  interview: { type: Schema.Types.ObjectId, ref: 'Interview' },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One application per candidate per job - enforced by the database, not just by code.
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export default mongoose.model('Application', applicationSchema);
