import express from "express";
import {
  createCategory,
  getAllCategorys,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../controller/adminController/categoryController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new category name
router.post("/", logActivity, createCategory);

// Get all category names
router.get("/", logActivity, getAllCategorys);

// Get category name by ID
router.get("/:id", logActivity, getCategoryById);

// Update a category name by id
router.put("/:id", logActivity, updateCategory);

// Delete a category name by id
router.delete("/:id", logActivity, deleteCategory);

export default router;
