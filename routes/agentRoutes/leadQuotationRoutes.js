import express from "express";
import {
  createNewQuotation,
  getAllQuotation,
  getQuotationById,
  getQuotationsByLeadId,
  updateQuotation,
  deleteQuotation,
} from "../../controller/agentController/leadQuotationController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Create a new quotation
router.post("/", logActivity,createNewQuotation);

// Get all quotations
router.get("/",logActivity, getAllQuotation);

// Get quotations by leadId
router.get("/leadId", logActivity,getQuotationsByLeadId); 

// Get quotation by ID
router.get("/:id", logActivity,getQuotationById);

// Update quotation by ID
router.put("/:id", logActivity,updateQuotation);

// Delete quotation by ID
router.delete("/:id",logActivity,deleteQuotation);

export default router;
