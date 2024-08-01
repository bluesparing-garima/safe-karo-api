import express from 'express';
import {compareBrokerExcel,comparePartnerExcel} from '../controller/excelCompare.js';
import logActivity from '../middlewares/logActivity.js';
import multer from 'multer';

// Configure Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to handle file uploads
const uploadSingle = upload.single('excel');

const router = express.Router();

router.post('/compare-broker-excel',logActivity,uploadSingle,compareBrokerExcel);
router.post('/compare-partner-excel',logActivity,uploadSingle,comparePartnerExcel)


export default router;