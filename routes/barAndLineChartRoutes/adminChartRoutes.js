import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import {
    getAllUserCountsByTimeframe,
  getPayInPayOutCommissionsByTimeframe,
} from "../../controller/barAndLineChartController.js/adminDashboardChartController.js";

const router = express.Router();
router.get(
  "/commission",
  logActivity,
  getPayInPayOutCommissionsByTimeframe
);
router.get("/policy-count", logActivity,getAllUserCountsByTimeframe);

export default router;
