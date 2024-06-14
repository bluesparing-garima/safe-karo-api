import express from "express";
import {
  createProductType,
  getAllProductTypes,
  getProductTypeByName,
  getProductTypeById,
  updateProductType,
  deleteProductType
} from "../controller/adminController/productSubTypeController.js";

const router = express.Router();

// Create a new vehicle type
router.post('/', createProductType);

// Get all vehicle types
router.get('/', getAllProductTypes);

// Get a vehicle type by Name
router.get('/name/:vehicleType', getProductTypeByName);

// Get vehicle type by ID
router.get('/:id', getProductTypeById);

// Update a vehicle type by id
router.put('/:id', updateProductType);

// Delete a vehicle type by id
router.delete('/:id', deleteProductType);

export default router;
