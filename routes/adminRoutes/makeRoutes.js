import express from "express";
import {
  createMake,
  getAllMakes,
  validateMake,
  getMakeById,
  updateMake,
  deleteMake,
} from "../../controller/adminController/makeController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new maker name
router.post("/", logActivity, createMake);

// Get all maker names
router.get("/", logActivity, getAllMakes);

// Check make exist or not.
router.get("/validate-make/:make", logActivity, validateMake);
// Get maker name by ID
router.get("/:id", logActivity, getMakeById);

// Update a maker name by id
router.put("/:id", logActivity, updateMake);

// Delete a maker name by id
router.delete("/:id", logActivity, deleteMake);

export default router;
