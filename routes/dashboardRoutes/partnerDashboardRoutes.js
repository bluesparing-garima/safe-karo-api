import express from "express";
import { getPartnerDashboardCount } from "../../controller/dashboard/partnerDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/", logActivity, getPartnerDashboardCount);
//router.get("/:partnerId", logActivity, getPartnerDashboardCount);
export default router;