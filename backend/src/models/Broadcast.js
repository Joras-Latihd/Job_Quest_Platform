import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: { type: String, enum: ['ALL', 'JOB_SEEKER', 'EMPLOYER'], default: 'ALL' },
  recipients: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Broadcast', broadcastSchema);
