import express from "express";
import { getAllBrokersWithPayInCommissionAndDateFilter,getAllBrokersWithPayInCommission,getPayInCommissionByBrokerAndCompanyWithDateFilter,getPayInCommissionByBrokerAndCompany } from "../../../controller/dashboard/brokerAdminDashboard/brokerAdminDashboardController.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

// Route for counting users by role
router.get("/broker-date-filter", logActivity, getAllBrokersWithPayInCommissionAndDateFilter);
router.get("/", logActivity, getAllBrokersWithPayInCommission);
router.get("/company-name/broker-date-filter", logActivity, getPayInCommissionByBrokerAndCompanyWithDateFilter);
router.get("/company-name", logActivity, getPayInCommissionByBrokerAndCompany);
export default router;
