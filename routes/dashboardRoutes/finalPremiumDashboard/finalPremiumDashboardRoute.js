import express from "express";
import {
  getAllPartnersWithFinalPremium,
  getAllPartnersWithFinalPremiumAndDateFilter,
  getAllBrokersWithFinalPremium,
  getAllBrokersWithFinalPremiumAndDateFilter,
  getCompaniesByPartnerIdAndCategory,
  getCompaniesByBrokerIdAndCategory,
  getCompaniesByPartnerIdCategoryAndDateFilter,
  getCompaniesByBrokerIdCategoryAndDateFilter,
} from "../../../controller/dashboard/finalPremiumDashboard/finalPremiumDashboardController.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

router.get("/partner", logActivity, getAllPartnersWithFinalPremium);
router.get(
  "/partner/date-filter",
  logActivity,
  getAllPartnersWithFinalPremiumAndDateFilter
);
router.get(
  "/partner/companies",
  logActivity,
  getCompaniesByPartnerIdAndCategory
);
router.get(
  "/partner/companies/date-filter",
  logActivity,
  getCompaniesByPartnerIdCategoryAndDateFilter
);

router.get("/broker", logActivity, getAllBrokersWithFinalPremium);
router.get(
  "/broker/date-filter",
  logActivity,
  getAllBrokersWithFinalPremiumAndDateFilter
);
router.get("/broker/companies", logActivity, getCompaniesByBrokerIdAndCategory);
router.get(
  "/broker/companies/date-filter",
  logActivity,
  getCompaniesByBrokerIdCategoryAndDateFilter
);

export default router;
