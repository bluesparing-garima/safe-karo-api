import express from "express";
import { getBookingDashboardCount } from "../../controller/dashboard/bookingDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/:policyCompletedBy", logActivity, getBookingDashboardCount);

export default router;
