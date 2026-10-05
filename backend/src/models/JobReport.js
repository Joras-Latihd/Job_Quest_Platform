import mongoose from 'mongoose';
import { REPORT_REASON_LIST, REPORT_STATUS_LIST } from '../constants/index.js';

const jobReportSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, enum: REPORT_REASON_LIST, required: true },
  details: { type: String, maxlength: 500 },
  status: { type: String, enum: REPORT_STATUS_LIST, default: 'PENDING', index: true },
}, { timestamps: true });

jobReportSchema.index({ job: 1, reporter: 1 });

export default mongoose.model('JobReport', jobReportSchema);
