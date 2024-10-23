import expres from "express";
import {
  createProductName,
  getAllProductNames,
  getProductNameById,
  updateProductName,
  deleteProductName,
  getProductByCategoryName,
} from "../../controller/adminController/productController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = expres.Router();

// Create a new product type
router.post("/", logActivity, createProductName);

// Get all case types or filter by product name
router.get("/", logActivity, getAllProductNames);

// Get product types by ID
router.get("/:id", logActivity, getProductNameById);

// Get product types by categoryName
router.get("/categoryName/:categoryName", logActivity, getProductByCategoryName);

// Update a product type by id
router.put("/:id", logActivity, updateProductName);

// Delete a product type by id
router.delete("/:id", logActivity, deleteProductName);

export default router;
