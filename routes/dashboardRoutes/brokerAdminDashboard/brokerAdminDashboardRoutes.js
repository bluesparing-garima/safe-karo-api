import express from "express";
import { getAllBrokersWithPayInCommissionAndDateFilter,getAllBrokersWithPayInCommission } from "../../../controller/dashboard/brokerAdminDashboard/brokerAdminDashboardController.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

// Route for counting users by role
router.get("/broker-date-filter", logActivity, getAllBrokersWithPayInCommissionAndDateFilter);
router.get("/", logActivity, getAllBrokersWithPayInCommission);

export default router;
