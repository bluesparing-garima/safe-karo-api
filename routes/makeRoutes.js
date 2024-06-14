import express from "express";
import {
    createMake, getAllMakes, getMakeById, updateMake, deleteMake 
} from "../controller/adminController/makeController.js";

const router = express.Router();

// Create a new broker name
router.post('/', createMake);

// Get all broker names
router.get('/', getAllMakes);

// Get broker name by ID
router.get('/:id', getMakeById);

// Update a broker name by id
router.put('/:id', updateMake);

// Delete a broker name by id
router.delete('/:id', deleteMake);

export default router;
