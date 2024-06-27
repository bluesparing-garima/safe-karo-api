import express from "express";
import {
  createProductType,
  getAllProductTypes,
  getProductTypeByName,
  getProductTypeById,
  updateProductType,
  deleteProductType,
} from "../../controller/adminController/productSubTypeController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new vehicle type
router.post("/", logActivity, createProductType);

// Get all vehicle types
router.get("/", logActivity, getAllProductTypes);

// Get a vehicle type by Name
router.get("/name/:vehicleType", logActivity, getProductTypeByName);

// Get vehicle type by ID
router.get("/:id", logActivity, getProductTypeById);

// Update a vehicle type by id
router.put("/:id", logActivity, updateProductType);

// Delete a vehicle type by id
router.delete("/:id", logActivity, deleteProductType);

export default router;
