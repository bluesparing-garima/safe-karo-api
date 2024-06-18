import express from "express";
import {
    createModel, getAllModels, getModelById, updateModel, deleteModel 
} from "../controller/adminController/modelController.js";

const router = express.Router();

// Create a new model name
router.post('/', createModel);

// Get all model names
router.get('/', getAllModels);

// Get model  by ID
router.get('/:id', getModelById);

// Update a model  by id
router.put('/:id', updateModel);

// Delete a model by id
router.delete('/:id', deleteModel);

export default router;
