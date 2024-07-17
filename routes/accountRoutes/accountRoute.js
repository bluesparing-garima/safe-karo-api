import express from 'express';
import { createAccount } from '../../controller/accountsController/accountController.js';
import logActivity from '../../middlewares/logActivity.js';

const router = express.Router();

router.post('/',logActivity,createAccount);

export default router;