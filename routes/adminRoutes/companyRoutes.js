import express from "express";
import {
  createCompanyName,
  getAllCompanyNames,
  getCompanyNameById,
  updateCompanyName,
  deleteCompanyName,
} from "../../controller/adminController/companyController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new vehicle type
router.post("/", logActivity, createCompanyName);

// Get all case types or filter by vehicle name
router.get("/", logActivity, getAllCompanyNames);

// Get vehicle types by ID
router.get("/:id", logActivity, getCompanyNameById);

// Update a vehicle type by id
router.put("/:id", logActivity, updateCompanyName);

// Delete a vehicle type by id
router.delete("/:id", logActivity, deleteCompanyName);

export default router;
