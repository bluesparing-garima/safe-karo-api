import express from "express";
import { uploadExcel, getAllData } from "../../controller/adminController/payInExcelController.js";
import logActivity from "../../middlewares/logActivity.js";
import uploadSingleExcel from '../../middlewares/uploadSingleExcel.js';

const router = express.Router();

// Endpoint for uploading the Excel file
router.post("/", logActivity, uploadSingleExcel, uploadExcel);

// Endpoint for fetching all data
router.get("/data", logActivity, getAllData);

export default router;
