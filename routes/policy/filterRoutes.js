import {
  getAllMatchingRecords,
  getPoliciesByDateRange,
  updateCommissionByDateRange,
  updateODTPByDateRange,
  getPoliciesByDateRangeAndBrokerName,
  getPoliciesByDateRangeAndPartnerName,
} from "../../controller/policyController/filterController.js";
import express from "express";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();
router.get("/date-range", logActivity, getPoliciesByDateRange);
router.get("/policies", logActivity, getAllMatchingRecords);
router.get("/broker-name", logActivity, getPoliciesByDateRangeAndBrokerName);
router.get("/partner-name", logActivity, getPoliciesByDateRangeAndPartnerName);
router.put("/update-od-tp", logActivity, updateODTPByDateRange);
router.put("/calculate-commission", logActivity, updateCommissionByDateRange);
export default router;
