import express from "express";
import {
  createModel,
  getAllModels,
  getModelById,
  updateModel,
  deleteModel,
} from "../../controller/adminController/modelController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new model name
router.post("/", logActivity, createModel);

// Get all model names
router.get("/", logActivity, getAllModels);

// Get model  by ID
router.get("/:id", logActivity, getModelById);

// Update a model  by id
router.put("/:id", logActivity, updateModel);

// Delete a model by id
router.delete("/:id", logActivity, deleteModel);

export default router;
