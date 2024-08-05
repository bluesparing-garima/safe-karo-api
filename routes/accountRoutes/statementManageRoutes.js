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
router.get('/', logActivity,getAllStatements);
router.get('/:id', logActivity,getStatementById);
router.put('/:id', logActivity,updateStatement);
router.delete('/:id',logActivity, deleteStatement);

export default router;
