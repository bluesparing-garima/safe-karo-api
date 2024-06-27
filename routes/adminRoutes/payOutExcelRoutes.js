import express from "express";
import {
  uploadExcel,
  getAllData,
} from "../../controller/adminController/payOutExcelController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Endpoint for uploading the Excel file
router.post("/", logActivity, uploadExcel);

// Endpoint for fetching all data
router.get("/data", logActivity, getAllData);

export default router;
