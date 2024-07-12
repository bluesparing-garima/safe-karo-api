import { getAllMatchingRecords, getPoliciesByDateRange } from "../../controller/policyController/filterController.js";
import express from "express";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();
router.get("/date-range",logActivity, getPoliciesByDateRange);
router.get('/policies',logActivity,getAllMatchingRecords);
export default router;