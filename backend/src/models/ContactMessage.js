import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true, maxlength: 150 },
  message: { type: String, required: true, maxlength: 3000 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model('ContactMessage', contactMessageSchema);
