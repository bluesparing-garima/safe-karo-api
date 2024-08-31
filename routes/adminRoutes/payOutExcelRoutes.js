import express from "express";
import {
  uploadExcel,
  getAllData,
  updatePayOutValuesByPolicyNumber
} from "../../controller/adminController/payOutExcelController.js";
import logActivity from "../../middlewares/logActivity.js";
import uploadSingleExcel from "../../middlewares/uploadSingleExcel.js";

const router = express.Router();

// Endpoint for uploading the Excel file
router.post("/", logActivity, uploadSingleExcel, uploadExcel);

// Endpoint for uploading the Excel file with policyNumber
router.post("/update-payout-od-tp", logActivity, uploadSingleExcel,updatePayOutValuesByPolicyNumber);

// Endpoint for fetching all data
router.get("/data", logActivity, getAllData);

export default router;
