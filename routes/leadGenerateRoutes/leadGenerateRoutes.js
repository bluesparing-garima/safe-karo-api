import express from "express";
import { createNewLead,getAllLeads,getLeadById,updateLead,deleteLead, leadCommentsAndQuotation,getLeadPaymentDetailsById, leadGeneratePaymentController, getCommentsAndQuotationById} from "../../controller/leadGenerateController/leadGenerateController.js";
const router = express.Router();

// Create a new  Lead
router.post('/', createNewLead);

// Get all Leads
router.get('/', getAllLeads);

// Get Lead by id
router.get('/:id', getLeadById);

// Update a Lead
router.put('/:id', updateLead);

// Delete a Lead
router.delete('/:id', deleteLead);

// Comment and quotation

router.post("/lead-update/:id",leadCommentsAndQuotation);
router.get("/lead-update/:id",getCommentsAndQuotationById)

// payment details
router.post("/payment-update/:id",leadGeneratePaymentController);
router.get("/payment-update/:id",getLeadPaymentDetailsById)
export default router;
