import express from "express";
import {
    createBranchName, getAllBranchNames, getBranchNameById, updateBranchName, deleteBranchName 
} from "../controller/adminController/branchController.js";

const router = express.Router();

// Create a new branch name
router.post('/', createBranchName);

// Get all branch names
router.get('/', getAllBranchNames);

// Get branch name by ID
router.get('/:id', getBranchNameById);

// Update a branch name by id
router.put('/:id', updateBranchName);

// Delete a branch name by id
router.delete('/:id', deleteBranchName);

export default router;
