import expres from "express";
import {
  createProductName,
  getAllProductNames,
  getProductNameById,
  updateProductName,
  deleteProductName,
} from "../controller/adminController/productController.js";

const router = expres.Router();

// Create a new product type
router.post('/', createProductName);

// Get all case types or filter by product name
router.get('/', getAllProductNames);

// Get product types by ID
router.get('/:id', getProductNameById);

// Update a product type by id
router.put('/:id', updateProductName);

// Delete a product type by id
router.delete('/:id', deleteProductName);

export default router;