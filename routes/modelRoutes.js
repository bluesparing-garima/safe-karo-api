import express from "express";
import {
    createModel, getAllModels, getModelById, updateModel, deleteModel 
} from "../controller/adminController/modelController.js";

const router = express.Router();

// Create a new broker name
router.post('/', createModel);

// Get all broker names
router.get('/', getAllModels);

// Get broker name by ID
router.get('/:id', getModelById);

// Update a broker name by id
router.put('/:id', updateModel);

// Delete a broker name by id
router.delete('/:id', deleteModel);

export default router;
