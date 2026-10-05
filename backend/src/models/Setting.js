import mongoose from 'mongoose';

// A single document (key: "platform") holding rules that admins can change at runtime.
const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'platform', unique: true },
  requireJobApproval: { type: Boolean, default: true },
  requireEmployerVerification: { type: Boolean, default: true },
  allowRegistrations: { type: Boolean, default: true },
  popularSearches: { type: [String], default: ['Software Developer', 'Accountant', 'Marketing Officer', 'Graphic Designer', 'HR Officer', 'Internship'] },
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
