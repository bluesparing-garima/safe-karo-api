import express from 'express';
import creditAndDebit from '../../controller/accountsController/creditAndDebitController.js';
import logActivity from '../../middlewares/logActivity.js';

const router = express.Router();
