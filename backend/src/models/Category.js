import mongoose from 'mongoose';
import { slugify } from '../utils/helpers.js';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true, maxlength: 80 },
  slug: { type: String, unique: true, index: true },
  description: { type: String, maxlength: 300 },
  icon: { type: String, default: 'Briefcase' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
}, { timestamps: true });

categorySchema.pre('validate', function makeSlug() {
  if (this.isModified('name')) this.slug = slugify(this.name);
});

export default mongoose.model('Category', categorySchema);
