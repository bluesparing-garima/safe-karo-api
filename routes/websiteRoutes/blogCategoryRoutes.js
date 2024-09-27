import express from "express";
import {
  createBlogCategory,
  getAllBlogCategories,
  getBlogCategoryById,
  updateBlogCategoryById,
  deleteBlogCategoryById,
} from "../../controller/websiteController/blogCategoryController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

router.post("/", createBlogCategory, logActivity);
router.get("/", getAllBlogCategories, logActivity);
router.get("/:id", getBlogCategoryById, logActivity);
router.put("/:id", updateBlogCategoryById, logActivity);
router.delete("/:id", deleteBlogCategoryById, logActivity);

export default router;
