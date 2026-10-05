import mongoose from 'mongoose';
import { slugify } from '../utils/helpers.js';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  thumbnail: String,
  content: { type: String, required: true }, // plain text, paragraphs separated by a blank line
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, default: 'Career advice' },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  publishedAt: Date,
}, { timestamps: true });

articleSchema.pre('validate', function makeSlug() {
  if (!this.slug || this.isModified('title')) this.slug = slugify(this.title);
});

export default mongoose.model('Article', articleSchema);
