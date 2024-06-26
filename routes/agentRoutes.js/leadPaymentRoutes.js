import express from 'express';
import {
  createNewLeadPayment,
  getAllLeadPayments,
  getLeadPaymentById,
  updateLeadPayment,
  deleteLeadPayment
} from '../../controller/agentController/leadPaymentController.js';

const router = express.Router();

// Create a new lead payment
router.post('/', createNewLeadPayment);

// Get all lead payments
router.get('/', getAllLeadPayments);

// Get lead payment by ID
router.get('/:id', getLeadPaymentById);

// Update lead payment by ID
router.put('/:id', updateLeadPayment);

// Delete lead payment by ID
router.delete('/:id', deleteLeadPayment);

export default router;
