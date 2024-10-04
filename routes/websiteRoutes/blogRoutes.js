import express from "express";
import {
  createBlogPost,
  getAllBlogs,
  getBlogsByCategory,
  getBlogsByWebsite,
  getBlogPostById,
  updateBlogPostById,
  deleteBlogPostById,
} from "../../controller/websiteController/blogController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Route for creating a new blog post
router.post("/", createBlogPost, logActivity);

// Route for fetching all blog posts (optionally filtered by website)
router.get("/", getAllBlogs, logActivity);

// Route for fetching blogs by category
router.get("/category", getBlogsByCategory, logActivity);

// Route for fetching blogs by website
router.get("/website", getBlogsByWebsite, logActivity);

// Route for fetching a single blog post by ID
router.get("/:id", getBlogPostById, logActivity);

// Route for updating a blog post by ID
router.put("/:id", updateBlogPostById, logActivity);

// Route for deleting a blog post by ID
router.delete("/:id", deleteBlogPostById, logActivity);

export default router;
