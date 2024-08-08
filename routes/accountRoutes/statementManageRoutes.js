import express from 'express';
const router = express.Router();
import {
  createStatement,
  getAllStatements,
  getStatementsByPartnerId,
  getStatementById,
  updateStatement,
  deleteStatement,
  getStatementsByPartnerIdAndDateRangeQuery
} from '../../controller/accountsController/statementManageController.js';
import logActivity from '../../middlewares/logActivity.js';

// Create a new statement
router.post('/manage', logActivity, createStatement);

// Get all statements
router.get('/manage', logActivity, getAllStatements);

// Get statements by partner ID
router.get('/manage/:partnerId', logActivity, getStatementsByPartnerId);

// Get a single statement by ID
router.get('/manage/:id', logActivity, getStatementById);

// Update a statement by ID
router.put('/manage/:id', logActivity, updateStatement);

// Delete a statement by ID
router.delete('/manage/:id', logActivity, deleteStatement);

// Get statements by partnerId and date range (query parameters)
router.get('/date-range', logActivity, getStatementsByPartnerIdAndDateRangeQuery);

export default router;
