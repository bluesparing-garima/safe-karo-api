import { getAllMatchingRecords, getPoliciesByDateRange,updateODTPByDateRange } from "../../controller/policyController/filterController.js";
import express from "express";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();
router.get("/date-range",logActivity, getPoliciesByDateRange);
router.get('/policies',logActivity,getAllMatchingRecords);
router.put('/update-od-tp',logActivity, updateODTPByDateRange);
export default router;