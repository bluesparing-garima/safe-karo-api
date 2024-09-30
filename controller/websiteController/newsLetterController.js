import NewsLetterPost from "../../models/websiteModels/newsLetterSchema.js";
import { handleFileUpload } from "../../middlewares/uploadMiddleware.js";
import Category from "../../models/websiteModels/newsLetterCategorySchema.js";
import path from 'path';

// CREATE: Add a new newsLetter post with file upload handling
export const createNewsLetterPost = async (req, res) => {
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

      const newPost = new NewsLetterPost({
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
        message: "NewsLetter post created successfully.",
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

// READ: Get all newsLetter posts with
export const getAllNewsLetters = async (req, res) => {
  try {
    const posts = await NewsLetterPost.find();

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      categoryId: post.categoryId,
      category: post.category,
    }));

    res.status(200).json({
      message: "All newsLetter posts retrieved successfully.",
      data: formattedPosts,
      success: true,
      status: "success",
      totalCount: formattedPosts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get newsLetters filtered by category with categoryId and category in response
export const getNewsLettersByCategory = async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const existingCategory = await Category.findOne({ category, isActive: true });
    if (!existingCategory) {
      return res.status(400).json({ message: "Invalid or inactive category." });
    }

    const posts = await NewsLetterPost.find({ categoryId: existingCategory._id });

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      categoryId: post.categoryId,
      category: post.category,
    }));

    res.status(200).json({
      message: `NewsLetters in the category "${category}" retrieved successfully.`,
      data: formattedPosts,
      success: true,
      status: "success",
      totalCount: formattedPosts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get newsLetters filtered by website with categoryId and category in response
export const getNewsLettersByWebsite = async (req, res) => {
  const { website } = req.query;
  if (!website) {
    return res.status(400).json({ message: "Website is required" });
  }

  try {
    const posts = await NewsLetterPost.find({ website });

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      categoryId: post.categoryId,
      category: post.category,
    }));

    res.status(200).json({
      message: `NewsLetters for the website "${website}" retrieved successfully.`,
      data: formattedPosts,
      success: true,
      status: "success",
      totalCount: formattedPosts.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get a specific newsLetter post by ID
export const getNewsLetterPostById = async (req, res) => {
  try {
    const post = await NewsLetterPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      message: "NewsLetter post retrieved successfully.",
      data: post,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Update a newsLetter post by ID
export const updateNewsLetterPostById = async (req, res) => {
  handleFileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title, description, category, author, website, updatedBy } = req.body;

      const existingCategory = await Category.findOne({ category: category, isActive: true });
      if (!existingCategory) {
        return res.status(400).json({ message: "Invalid or inactive category." });
      }

      let updatedData = {
        title,
        description,
        categoryId: existingCategory._id,
        category: existingCategory.category,
        author,
        website,
        updatedBy,
        updatedOn: new Date(),
      };

      if (req.files && req.files.image) {
        updatedData.image = path.basename(req.files.image[0].path);
      }

      const updatedPost = await NewsLetterPost.findByIdAndUpdate(req.params.id, updatedData, { new: true });

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      const responsePost = {
        ...updatedPost.toObject(),
        categoryId: existingCategory._id,
        category: existingCategory.category,
      };

      res.status(200).json({
        message: "NewsLetter post updated successfully.",
        data: responsePost,
        success: true,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// DELETE: Remove a newsLetter post by ID
export const deleteNewsLetterPostById = async (req, res) => {
  try {
    const deletedPost = await NewsLetterPost.findByIdAndDelete(req.params.id);
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
