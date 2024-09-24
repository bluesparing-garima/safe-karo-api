import express from "express";
import {
  getAllPartnersWithNetPremium,
  getAllPartnersWithNetPremiumAndDateFilter,
  getAllBrokersWithNetPremium,
  getAllBrokersWithNetPremiumAndDateFilter,
  getCompaniesByPartnerIdAndCategory,
  getCompaniesByBrokerIdAndCategory,
  getCompaniesByPartnerIdCategoryAndDateFilter,
  getCompaniesByBrokerIdCategoryAndDateFilter,
} from "../../../controller/dashboard/netPremiumDashboard/netPremiumDashboard.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

router.get("/partner", logActivity, getAllPartnersWithNetPremium);
router.get(
  "/partner/date-filter",
  logActivity,
  getAllPartnersWithNetPremiumAndDateFilter
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

router.get("/broker", logActivity, getAllBrokersWithNetPremium);
router.get(
  "/broker/date-filter",
  logActivity,
  getAllBrokersWithNetPremiumAndDateFilter
);
router.get("/broker/companies", logActivity, getCompaniesByBrokerIdAndCategory);
router.get(
  "/broker/companies/date-filter",
  logActivity,
  getCompaniesByBrokerIdCategoryAndDateFilter
);

export default router;
