import { getAllMatchingRecords, getPoliciesByDateRange,updateCommissionByDateRange,updateODTPByDateRange} from "../../controller/policyController/filterController.js";
import express from "express";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();
router.get("/date-range",logActivity, getPoliciesByDateRange);
router.get('/policies',logActivity,getAllMatchingRecords);
router.put('/update-od-tp',logActivity, updateODTPByDateRange);
router.put('/calculate-commission',logActivity,updateCommissionByDateRange);
export default router;