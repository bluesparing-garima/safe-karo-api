import expres from "express";
import {
    createProductName,
  getAllproductNames,
  getproductNameById,
  updateproductName,
  deleteproductName,
} from "../controller/adminController/productController.js";

const router = expres.Router();

// Create a new product type
router.post('/', createProductName);

// Get all case types or filter by product name
router.get('/', getAllproductNames);

// Get product types by ID
router.get('/:id', getproductNameById);

// Update a product type by id
router.put('/:id', updateproductName);

// Delete a product type by id
router.delete('/:id', deleteproductName);

export default router;