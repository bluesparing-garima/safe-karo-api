import express from 'express';
import { compareBrokerExcel, comparePartnerExcel } from '../controller/excelCompare.js';
import logActivity from '../middlewares/logActivity.js';
import uploadSingle from "../middlewares/uploadSingleExcel.js"; // Import the middleware

const router = express.Router();

router.post('/compare-broker-excel', logActivity, uploadSingle, compareBrokerExcel);
router.post('/compare-partner-excel', logActivity, uploadSingle, comparePartnerExcel);

export default router;
