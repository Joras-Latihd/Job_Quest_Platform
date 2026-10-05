import mongoose from 'mongoose';
import { INTERVIEW_TYPE_LIST } from '../constants/index.js';

const { Schema } = mongoose;

const interviewSchema = new Schema({
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  type: { type: String, enum: INTERVIEW_TYPE_LIST, default: 'ONLINE' },
  locationOrLink: { type: String, required: true, trim: true },
  notes: String,
  status: { type: String, enum: ['SCHEDULED', 'CANCELLED'], default: 'SCHEDULED' },
}, { timestamps: true });

interviewSchema.index({ candidate: 1, scheduledAt: 1 });
interviewSchema.index({ employer: 1, scheduledAt: 1 });
interviewSchema.index({ application: 1 });

export default mongoose.model('Interview', interviewSchema);
