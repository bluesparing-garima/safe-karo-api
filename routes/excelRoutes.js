import express from 'express';
import { uploadExcel, getAllData } from '../controller/adminController/excelController.js';

const router = express.Router();

// Endpoint for uploading the Excel file
router.post('/', uploadExcel);

// Endpoint for fetching all data
router.get('/', getAllData);

export default router;
