import express from "express";
import {
  createModel,
  getAllModels,
  validateModel,
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

// validate the model
router.get("/validate-model/:model", logActivity, validateModel);

// Get model  by ID
router.get("/:id", logActivity, getModelById);

// Update a model  by id
router.put("/:id", logActivity, updateModel);

// Delete a model by id
router.delete("/:id", logActivity, deleteModel);

export default router;
