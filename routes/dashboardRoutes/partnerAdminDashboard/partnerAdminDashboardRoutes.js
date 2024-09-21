import express from "express";
import {
  getAllPartnersWithPayOutCommissionAndDateFilter,
  getAllPartnersWithPayOutCommission,
  getPayOutCommissionByCompanyWithDate,
  getPayOutCommissionByCompany,
  getAllPartnersWithPayOutAmountAndDateFilter,
  getAllPartnersWithPayOutAmount,
  getPayOutAmountByCompanyWithDate,
  getPayOutAmountByCompany,
  getAllPartnersWithUnpaidAndPartialPayOutAmountAndDateFilter,
  getAllPartnersWithUnpaidAndPartialPayOutAmount,
  getUnpaidAndPartialPayOutAmountByCompanyWithDate,
  getUnpaidAndPartialPayOutAmountByCompany,
  getAllPartnersWithPartnerBalanceAndDateFilter,
  getAllPartnersWithPartnerBalance,
  getPartnerBalanceByCompanyWithDate,
  getPartnerBalanceByCompany

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

// payOut Amount = "Paid"
router.get(
  "/payout-amount/date-filter",
  logActivity,
  getAllPartnersWithPayOutAmountAndDateFilter
);
router.get("/payout-amount", logActivity, getAllPartnersWithPayOutAmount);
router.get(
  "/payout-amount/company-name/date-filter",
  logActivity,
  getPayOutAmountByCompanyWithDate
);
router.get("/payout-amount/company-name", logActivity, getPayOutAmountByCompany);

// payOut Amount = "UnPaid or Partial
router.get(
  "/payout-amount-unpaid/date-filter",
  logActivity,
  getAllPartnersWithUnpaidAndPartialPayOutAmountAndDateFilter
);
router.get("/payout-amount-unpaid", logActivity, getAllPartnersWithUnpaidAndPartialPayOutAmount);
router.get(
  "/payout-amount-unpaid/company-name/date-filter",
  logActivity,
  getUnpaidAndPartialPayOutAmountByCompanyWithDate
);
router.get("/payout-amount-unpaid/company-name", logActivity, getUnpaidAndPartialPayOutAmountByCompany);

// partnerBalance
router.get("/partner-balance", logActivity, getAllPartnersWithPartnerBalance);
router.get(
  "/partner-balance/date-filter",
  logActivity,
  getAllPartnersWithPartnerBalanceAndDateFilter
);
router.get("/partner-balance/company-name", logActivity, getPartnerBalanceByCompany);
router.get(
  "/partner-balance/company-name/date-filter",
  logActivity,
  getPartnerBalanceByCompanyWithDate
);

export default router;
