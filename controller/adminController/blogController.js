import BlogPost from "../../models/adminModels/blogSchema.js";
import { handleFileUpload } from "../../middlewares/uploadMiddleware.js";

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
      const { title, description, category, author, website, createdBy, date, isActive } = req.body;

      const image = req.files.image ? req.files.image[0].path : "";

      const newPost = new BlogPost({
        title,
        description,
        category,
        author,
        website,
        createdBy,
        image,
        date: date || new Date(), 
        isActive: isActive !== undefined ? isActive : true,
        createdOn: new Date(),
      });

      const savedPost = await newPost.save();

      res.status(201).json(savedPost);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// READ: Get all blog posts optionally filtered by website
export const getAllBlogPosts = async (req, res) => {
  const { website } = req.query;
  let filter = {};

  if (website) {
    filter.website = website;
  }

  try {
    const posts = await BlogPost.find(filter);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get blogs filtered by category
export const getBlogsByCategory = async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const posts = await BlogPost.find({ category });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get blogs filtered by website
export const getBlogsByWebsite = async (req, res) => {
  const { website } = req.query;
  if (!website) {
    return res.status(400).json({ message: "Website is required" });
  }

  try {
    const posts = await BlogPost.find({ website });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get a specific blog post by ID
export const getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Update a blog post by ID
export const updateBlogPostById = async (req, res) => {
    try {
      const { title, description, category, author, website, updatedBy } = req.body;
      let updatedData = { title, description, category, author, website, updatedBy, updatedOn: new Date() };
  
      if (req.files?.image) {
        updatedData.image = req.files.image[0].path;
      }
      const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, updatedData, { new: true });
      if (!updatedPost) return res.status(404).json({ message: "Post not found" });
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// DELETE: Remove a blog post by ID
export const deleteBlogPostById = async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
