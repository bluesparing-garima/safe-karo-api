import express from "express";
import { getAgentDashboardCount } from "../../controller/dashboard/agentDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/:partnerId", logActivity, getAgentDashboardCount);

export default router;
