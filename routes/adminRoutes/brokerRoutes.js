import express from "express";
import {
  createBrokerName,
  getAllBrokerNames,
  getBrokerNameById,
  updateBrokerName,
  deleteBrokerName,
} from "../../controller/adminController/brokerController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new broker name
router.post("/", logActivity, createBrokerName);

// Get all broker names
router.get("/", logActivity, getAllBrokerNames);

// Get broker name by ID
router.get("/:id", logActivity, getBrokerNameById);

// Update a broker name by id
router.put("/:id", logActivity, updateBrokerName);

// Delete a broker name by id
router.delete("/:id", logActivity, deleteBrokerName);

export default router;
