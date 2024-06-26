import express from "express";
import {
  createNewQuotation,
  getAllQuotation,
  getQuotationById,
  getQuotationsByLeadId,
  updateQuotation,
  deleteQuotation,
} from "../../controller/agentController/leadQuotationController.js";

const router = express.Router();

// Create a new quotation
router.post("/", createNewQuotation);

// Get all quotations
router.get("/", getAllQuotation);

// Get quotations by leadId
router.get("/leadId", getQuotationsByLeadId); 

// Get quotation by ID
router.get("/:id", getQuotationById);

// Update quotation by ID
router.put("/:id", updateQuotation);

// Delete quotation by ID
router.delete("/:id", deleteQuotation);

export default router;
