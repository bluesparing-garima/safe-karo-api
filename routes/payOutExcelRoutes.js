import express from 'express';
import { uploadExcel, getAllData } from '../controller/adminController/payOutExcelController.js';

const router = express.Router();

// Endpoint for uploading the Excel file
router.post('/', uploadExcel);

// Endpoint for fetching all data
router.get('/data', getAllData);

export default router;
