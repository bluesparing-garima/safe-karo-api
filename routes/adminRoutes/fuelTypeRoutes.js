import express from "express";
import {
  createFuelType,
  getAllFuelTypes,
  getFuelTypeById,
  updateFuelType,
  deleteFuelType,
} from "../../controller/adminController/fuelTypeController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new broker name
router.post("/", logActivity, createFuelType);

// Get all broker names
router.get("/", logActivity, getAllFuelTypes);

// Get broker name by ID
router.get("/:id", logActivity, getFuelTypeById);

// Update a broker name by id
router.put("/:id", logActivity, updateFuelType);

// Delete a broker name by id
router.delete("/:id", logActivity, deleteFuelType);

export default router;
