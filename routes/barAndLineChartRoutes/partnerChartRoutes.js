import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import {
  getPayOutCommissionByPartner,
  getMotorPolicyCountsByPartner,
} from "../../controller/barAndLineChartController.js/partnerDashboardChartController.js";

const router = express.Router();
router.get(
  "/payout-commission-partner",
  logActivity,
  getPayOutCommissionByPartner
);
router.get("/policy-count-partner", logActivity, getMotorPolicyCountsByPartner);

export default router;
