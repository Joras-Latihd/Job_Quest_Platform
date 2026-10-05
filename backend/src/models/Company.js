import mongoose from 'mongoose';
import { COMPANY_SIZE_LIST, VERIFICATION_STATUS_LIST } from '../constants/index.js';

const companySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: [true, 'Company name is required'], trim: true, maxlength: 150 },
  logo: String,
  logoPublicId: String,
  coverImage: String,
  coverImagePublicId: String,
  industry: { type: String, trim: true },
  description: { type: String, maxlength: 5000 },
  website: String,
  email: { type: String, lowercase: true, trim: true },
  phone: String,
  address: String,
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  size: { type: String, enum: [...COMPANY_SIZE_LIST, ''] },
  foundedYear: Number,
  socialLinks: { linkedin: String, facebook: String, twitter: String },
  verificationStatus: { type: String, enum: VERIFICATION_STATUS_LIST, default: 'PENDING', index: true },
  verificationNote: String,
}, { timestamps: true });

companySchema.index({ name: 1 });
companySchema.index({ industry: 1, location: 1 });

export default mongoose.model('Company', companySchema);
