import mongoose from 'mongoose';
import { ALERT_FREQUENCY_LIST, JOB_TYPES } from '../constants/index.js';

const jobAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  keywords: { type: String, required: true, trim: true },
  location: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  jobType: { type: String, enum: [...JOB_TYPES, ''] },
  minSalary: Number,
  frequency: { type: String, enum: ALERT_FREQUENCY_LIST, default: 'DAILY' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

jobAlertSchema.index({ isActive: 1 });

export default mongoose.model('JobAlert', jobAlertSchema);
