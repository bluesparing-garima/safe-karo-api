import BlogPost from "../../models/websiteModels/blogSchema.js";
import { handleFileUpload } from "../../middlewares/uploadMiddleware.js";
import Category from "../../models/websiteModels/blogCategorySchema.js";
import path from 'path';

// CREATE: Add a new blog post with file upload handling
export const createBlogPost = async (req, res) => {
  handleFileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded!" });
    }

    try {
      const {
        title,
        description,
        category,
        author,
        website,
        createdBy,
        date,
        isActive,
      } = req.body;

      const existingCategory = await Category.findOne({ category: category, isActive: true });
      if (!existingCategory) {
        return res.status(400).json({ message: "Invalid or inactive category." });
      }

      const categoryId = existingCategory._id;
      const image = req.files.image ? path.basename(req.files.image[0].path) : "";

      const newPost = new BlogPost({
        title,
        description,
        categoryId,
        category: existingCategory.category,
        author,
        website,
        createdBy,
        image,
        date,
        isActive: isActive !== undefined ? isActive : true,
        createdOn: new Date(),
      });

      const savedPost = await newPost.save();

      res.status(201).json({
        message: "Blog post created successfully.",
        data: {
          ...savedPost.toObject(),
          categoryId: savedPost.categoryId,
          category: existingCategory.category,
        },
        success: true,
        status: "success",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// READ: Get all blog posts with
export const getAllBlogs = async (req, res) => {
  try {
    const posts = await BlogPost.find();

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      categoryId: post.categoryId,
      category: post.category,
    }));

    res.status(200).json({
      message: "All blog posts retrieved successfully.",
      data: formattedPosts,
      success: true,
      status: "success",
      totalCount: formattedPosts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get blogs filtered by category with categoryId and category in response
export const getBlogsByCategory = async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const existingCategory = await Category.findOne({ category, isActive: true });
    if (!existingCategory) {
      return res.status(400).json({ message: "Invalid or inactive category." });
    }

    const posts = await BlogPost.find({ categoryId: existingCategory._id });

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      categoryId: post.categoryId,
      category: post.category,
    }));

    res.status(200).json({
      message: `Blogs in the category "${category}" retrieved successfully.`,
      data: formattedPosts,
      success: true,
      status: "success",
      totalCount: formattedPosts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get blogs filtered by website with categoryId and category in response
export const getBlogsByWebsite = async (req, res) => {
  const { website } = req.query;
  if (!website) {
    return res.status(400).json({ message: "Website is required" });
  }

  try {
    const posts = await BlogPost.find({ website });

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      categoryId: post.categoryId,
      category: post.category,
    }));

    res.status(200).json({
      message: `Blogs for the website "${website}" retrieved successfully.`,
      data: formattedPosts,
      success: true,
      status: "success",
      totalCount: formattedPosts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get a specific blog post by ID
export const getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      message: "Blog post retrieved successfully.",
      data: post,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Update a blog post by ID
export const updateBlogPostById = async (req, res) => {
  handleFileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title, description, category, author, website, updatedBy } = req.body;
      const updatedData = {};

      if (title) updatedData.title = title;
      if (description) updatedData.description = description;
      if (author) updatedData.author = author;
      if (website) updatedData.website = website;
      if (updatedBy) updatedData.updatedBy = updatedBy;
      updatedData.updatedOn = new Date();

      if (category) {
        const existingCategory = await Category.findOne({ category });
        if (!existingCategory) {
          return res.status(400).json({ message: "Invalid category." });
        }
        updatedData.categoryId = existingCategory._id;
        updatedData.category = existingCategory.category;
      }

      if (req.files?.image) {
        updatedData.image = path.basename(req.files.image[0].path);
      }

      const updatedPost = await BlogPost.findByIdAndUpdate(
        req.params.id,
        { $set: updatedData },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({
        message: "Blog post updated successfully.",
        data: updatedPost,
        success: true,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// DELETE: Remove a blog post by ID
export const deleteBlogPostById = async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      message: "Post deleted successfully",
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
