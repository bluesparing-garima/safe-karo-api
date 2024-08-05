import express from 'express';
const router = express.Router();
import {
  createStatement,
  getAllStatements,
  getStatementById,
  updateStatement,
  deleteStatement
} from '../../controller/accountsController/statementManageController.js';
import logActivity from '../../middlewares/logActivity.js';
router.post('/manage', logActivity,createStatement);
router.get('/manage', logActivity,getAllStatements);
router.get('/manage/:id', logActivity,getStatementById);
router.put('/manage/:id', logActivity,updateStatement);
router.delete('/manage/:id',logActivity, deleteStatement);

export default router;
