import express from "express";
import { getAllPartnersWithPayOutCommissionAndDateFilter,getAllPartnersWithPayOutCommission } from "../../../controller/dashboard/partnerAdminDashboard/partnerAdminDashboardController.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

// Route for counting users by role
router.get("/date-filter", logActivity, getAllPartnersWithPayOutCommissionAndDateFilter);
router.get("/", logActivity, getAllPartnersWithPayOutCommission);

export default router;
