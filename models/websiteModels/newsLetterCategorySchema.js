import mongoose from 'mongoose';

const newsLetterCategorySchema = new mongoose.Schema({
  category: { type: String },
  createdOn: { type: Date, default: Date.now },
  createdBy: { type: String },
  isActive: { type: Boolean, default: true },
});

const NewsLetterCategory = mongoose.models.Category || mongoose.model('newsLetterCategory', newsLetterCategorySchema);

export default NewsLetterCategory;
