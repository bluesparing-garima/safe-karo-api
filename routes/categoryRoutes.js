import express from "express";
import {
    createCategory,
    getAllCategorys,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "../controller/adminController/categoryController.js";

const router = express.Router();

// Create a new category name
router.post('/', createCategory);

// Get all category names
router.get('/', getAllCategorys);

// Get category name by ID
router.get('/:id', getCategoryById);

// Update a category name by id
router.put('/:id', updateCategory);

// Delete a category name by id
router.delete('/:id', deleteCategory);

export default router;
