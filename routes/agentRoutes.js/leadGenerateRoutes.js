import express from "express";
import {
  createNewLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../../controller/agentController/leadGenerateController.js";
const router = express.Router();

// Create a new  Lead
router.post("/", createNewLead);

// Get all Leads
router.get("/", getAllLeads);

// Get Lead by id
router.get("/:id", getLeadById);

// Update a Lead
router.put("/:id", updateLead);

// Delete a Lead
router.delete("/:id", deleteLead);

export default router;
