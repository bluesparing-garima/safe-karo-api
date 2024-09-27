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

      const image = req.files.image ? req.files.image[0].path : "";

      const formattedDate = date
        ? new Date(date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const newPost = new BlogPost({
        title,
        description,
        category,
        author,
        website,
        createdBy,
        image,
        date: formattedDate, // Use the formatted date here
        isActive: isActive !== undefined ? isActive : true,
        createdOn: new Date(),
      });

      const savedPost = await newPost.save();

      res.status(201).json({
        message: "Blog post created successfully.",
        data: savedPost,
        success: true,
        status: "success",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// READ: Get all blog posts without any filters
export const getAllBlogs = async (req, res) => {
  try {
    const posts = await BlogPost.find();
    const totalCount = posts.length;

    res.status(200).json({
      message: "All blog posts retrieved successfully.",
      data: posts,
      success: true,
      status: "success",
      totalCount,
    });
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
    const totalCount = posts.length;

    res.status(200).json({
      message: `Blogs in the category "${category}".`,
      data: posts,
      success: true,
      status: "success",
      totalCount,
    });
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
    const totalCount = posts.length;

    res.status(200).json({
      message: `Blogs for the website "${website}".`,
      data: posts,
      success: true,
      status: "success",
      totalCount,
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
  try {
    const { title, description, category, author, website, updatedBy } =
      req.body;
    let updatedData = {
      title,
      description,
      category,
      author,
      website,
      updatedBy,
      updatedOn: new Date(),
    };

    if (req.files?.image) {
      updatedData.image = req.files.image[0].path;
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      message: "Blog post updated successfully.",
      data: updatedPost,
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Remove a blog post by ID
export const deleteBlogPostById = async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      message: "Post deleted successfully",
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
