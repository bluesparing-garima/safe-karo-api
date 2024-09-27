import express from "express";
import {
  createBlogCategory,
  getAllBlogCategories,
  getBlogCategoryById,
  updateBlogCategoryById,
  deleteBlogCategoryById,
} from "../../controller/blogController/blogCategoryController.js";

const router = express.Router();

router.post("/", createBlogCategory);
router.get("/", getAllBlogCategories);
router.get("/:id", getBlogCategoryById);
router.put("/:id", updateBlogCategoryById);
router.delete("/:id", deleteBlogCategoryById);

export default router;
