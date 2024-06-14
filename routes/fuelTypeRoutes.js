import express from "express";
import {
    createFuelType, getAllFuelTypes, getFuelTypeById, updateFuelType, deleteFuelType 
} from "../controller/adminController/fuelTypeController.js";

const router = express.Router();

// Create a new broker name
router.post('/', createFuelType);

// Get all broker names
router.get('/', getAllFuelTypes);

// Get broker name by ID
router.get('/:id', getFuelTypeById);

// Update a broker name by id
router.put('/:id', updateFuelType);

// Delete a broker name by id
router.delete('/:id', deleteFuelType);

export default router;
