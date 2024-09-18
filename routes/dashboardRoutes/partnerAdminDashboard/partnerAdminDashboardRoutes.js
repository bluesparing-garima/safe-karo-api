import express from "express";
import {
  getAllPartnersWithPayOutCommissionAndDateFilter,
  getAllPartnersWithPayOutCommission,
  getPayOutCommissionByCompanyWithDate,
  getPayOutCommissionByCompany,
} from "../../../controller/dashboard/partnerAdminDashboard/partnerAdminDashboardController.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

router.get(
  "/date-filter",
  logActivity,
  getAllPartnersWithPayOutCommissionAndDateFilter
);
router.get("/", logActivity, getAllPartnersWithPayOutCommission);
router.get(
  "/company-name/date-filter",
  logActivity,
  getPayOutCommissionByCompanyWithDate
);
router.get("/company-name", logActivity, getPayOutCommissionByCompany);

export default router;
