import express from 'express';
import {createCreditAndDebit,getCreditAndDebit,getCreditAndDebitById,updateCreditAndDebitById,deleteCreditAndDebitById,getCreditAndDebitByDateRangeAndBrokerName,getTotalAmountByDateRangeAndBrokerName} from '../../controller/accountsController/creditAndDebitController.js';
import logActivity from '../../middlewares/logActivity.js';

const router = express.Router();


// Create Account
router.post('/', logActivity, createCreditAndDebit);

// Filter
router.get('/broker-name',logActivity,getCreditAndDebitByDateRangeAndBrokerName);

// total amount filter
router.get('/total-amount', logActivity, getTotalAmountByDateRangeAndBrokerName);

// Get All Account details
router.get('/', logActivity, getCreditAndDebit);

// Get Account by ID
router.get('/:id', logActivity, getCreditAndDebitById);

// Update Account
router.put('/:id', logActivity, updateCreditAndDebitById);

// Delete Account
router.delete('/:id', logActivity, deleteCreditAndDebitById);

export default router;