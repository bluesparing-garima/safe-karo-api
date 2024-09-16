import express from "express";
import { getBrokerDashboardCount } from "../../controller/dashboard/brokerDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/", logActivity, getBrokerDashboardCount);
//router.get("/:brokerId", logActivity, getBrokerDashboardCount);
export default router;
