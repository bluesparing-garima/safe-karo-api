import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  image: { type: String },
  date: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  category: { type: String, trim: true },
  author: { type: String, trim: true },
  website: { type: String },
  createdBy: { type: String },
  createdOn: { type: Date, default: Date.now },
  updatedBy: { type: String, default: null },
  updatedOn: { type: Date },
  isActive: { type: Boolean, default: true },
  categoryId: { type: String, trim: true },
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;
