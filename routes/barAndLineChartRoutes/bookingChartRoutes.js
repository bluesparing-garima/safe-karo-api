import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import {
    getMotorPolicyCountsByPolicyCompletedBy,
} from "../../controller/barAndLineChartController.js/bookingDashboardChartController.js";

const router = express.Router();
router.get("/policy-count-booking", logActivity, getMotorPolicyCountsByPolicyCompletedBy);

export default router;
