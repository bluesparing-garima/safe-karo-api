import express from "express";
import {
    createMake, getAllMakes, getMakeById, updateMake, deleteMake 
} from "../controller/adminController/makeController.js";

const router = express.Router();

// Create a new maker name
router.post('/', createMake);

// Get all maker names
router.get('/', getAllMakes);

// Get maker name by ID
router.get('/:id', getMakeById);

// Update a maker name by id
router.put('/:id', updateMake);

// Delete a maker name by id
router.delete('/:id', deleteMake);

export default router;
