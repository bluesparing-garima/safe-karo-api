import express from "express";
import {
  createBlogPost,
  getAllBlogs,
  getBlogsByCategory,
  getBlogsByWebsite,
  getBlogPostById,
  updateBlogPostById,
  deleteBlogPostById,
} from "../../controller/adminController/blogController.js";

const router = express.Router();

// Route for creating a new blog post
router.post("/", createBlogPost);

// Route for fetching all blog posts (optionally filtered by website)
router.get("/", getAllBlogs);

// Route for fetching blogs by category
router.get("/category", getBlogsByCategory);

// Route for fetching blogs by website
router.get("/website", getBlogsByWebsite);

// Route for fetching a single blog post by ID
router.get("/:id", getBlogPostById);

// Route for updating a blog post by ID
router.put("/:id", updateBlogPostById);

// Route for deleting a blog post by ID
router.delete("/:id", deleteBlogPostById);

export default router;
