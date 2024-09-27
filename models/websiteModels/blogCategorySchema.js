import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  category: { type: String },
  createdOn: { type: Date, default: Date.now },
  createdBy: { type: String },
  isActive: { type: Boolean, default: true },
});

const BlogCategory = mongoose.models.Category || mongoose.model('BlogCategory', categorySchema);

export default BlogCategory;
