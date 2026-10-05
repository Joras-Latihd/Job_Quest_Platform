import mongoose from 'mongoose';

// Nepal is the default country, but the model supports any country.
const locationSchema = new mongoose.Schema({
  city: { type: String, required: [true, 'City is required'], trim: true },
  district: { type: String, trim: true },
  province: { type: String, trim: true },
  country: { type: String, required: true, trim: true, default: 'Nepal' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
}, { timestamps: true });

locationSchema.index({ city: 1, country: 1 }, { unique: true });

export default mongoose.model('Location', locationSchema);
