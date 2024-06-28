import express from "express";
import {
  createBranchName,
  getAllBranchNames,
  getBranchNameById,
  updateBranchName,
  deleteBranchName,
} from "../../controller/adminController/branchController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new branch name
router.post("/", logActivity, createBranchName);

// Get all branch names
router.get("/", logActivity, getAllBranchNames);

// Get branch name by ID
router.get("/:id", logActivity, getBranchNameById);

// Update a branch name by id
router.put("/:id", logActivity, updateBranchName);

// Delete a branch name by id
router.delete("/:id", logActivity, deleteBranchName);

export default router;
