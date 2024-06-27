import express from "express";
import {
  createNewLeadPayment,
  getAllLeadPayments,
  getLeadPaymentById,
  updateLeadPayment,
  deleteLeadPayment,
  getLeadPaymentsByLeadId, // Import the new function
} from "../../controller/agentController/leadPaymentController.js";

const router = express.Router();

// Create a new lead payment
router.post("/", createNewLeadPayment);

// Get all lead payments
router.get("/", getAllLeadPayments);

// Get lead payments by leadId
router.get("/leadId", getLeadPaymentsByLeadId); 

// Get lead payment by ID
router.get("/:id", getLeadPaymentById);

// Update lead payment by ID
router.put("/:id", updateLeadPayment);

// Delete lead payment by ID
router.delete("/:id", deleteLeadPayment);

export default router;
