import express from 'express';
import {compareBrokerExcel,comparePartnerExcel} from '../controller/excelCompare.js';
import logActivity from '../middlewares/logActivity.js';

const router = express.Router();

router.post('/compare-broker-excel',logActivity,compareBrokerExcel);
router.post('/compare-partner-excel',logActivity,comparePartnerExcel)



export default router;