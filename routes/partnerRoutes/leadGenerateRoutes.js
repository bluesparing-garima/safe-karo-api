import express from "express";
import {
  createNewLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getleadsByCreatedBy,
  getLeadsByPartnerId,
  acceptLeadRequest,
  getLeadsByRMId
} from "../../controller/partnerController/leadGenerateController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Create a new  Lead
router.post("/", logActivity,createNewLead);

// Get all Leads
router.get("/", logActivity,getAllLeads);

// Get all leads by CreateBy
router.get("/created-by/:leadCreatedBy",logActivity,getleadsByCreatedBy);

// Get all leads by partnerID
router.get("/partner-id/:partnerId",logActivity,getLeadsByPartnerId);

router.get("/relationship-manager",logActivity,getLeadsByRMId);

// Get Lead by id
router.get("/:id",logActivity,getLeadById);

// Accept a lead request
router.put("/accepted-lead/:id",logActivity, acceptLeadRequest);

// Update a Lead
router.put("/:id", logActivity,updateLead);

// Delete a Lead
router.delete("/:id", logActivity,deleteLead);

export default router;
