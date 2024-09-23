import express from "express";
import {
  getAllBrokersWithPayInCommissionAndDateFilter,
  getAllBrokersWithPayInCommission,
  getPayInCommissionByBrokerAndCompanyWithDateFilter,
  getPayInCommissionByBrokerAndCompany,
  getAllBrokersWithPayInAmountAndDateFilter,
  getAllBrokersWithPayInAmount,
  getPayInAmountByBrokerAndCompanyWithDateFilter,
  getPayInAmountByBrokerAndCompany,
  getBrokersWithUnpaidOrPartialPayInAmount,
  getBrokersWithUnpaidOrPartialPayInAmountAndDateFilter,
  getUnpaidAndPartialPayInAmountByCompany,
  getUnpaidAndPartialPayInAmountByCompanyWithDate,
  getBrokerBalanceForAllBrokers,
  getBrokerBalanceWithDateFilter,
  getBrokerBalanceByBrokerAndCompany,
  getBrokerBalanceByBrokerAndCompanyWithDateFilter
} from "../../../controller/dashboard/brokerAdminDashboard/brokerAdminDashboardController.js";
import logActivity from "../../../middlewares/logActivity.js";
const router = express.Router();

// Route for counting users by role
router.get(
  "/broker-date-filter",
  logActivity,
  getAllBrokersWithPayInCommissionAndDateFilter
);
router.get("/", logActivity, getAllBrokersWithPayInCommission);
router.get(
  "/company-name/broker-date-filter",
  logActivity,
  getPayInCommissionByBrokerAndCompanyWithDateFilter
);
router.get("/company-name", logActivity, getPayInCommissionByBrokerAndCompany);

// payInPaymentStatus : "Paid"
router.get("/payin", logActivity, getAllBrokersWithPayInAmount);
router.get(
  "/payin/date-filter",
  logActivity,
  getAllBrokersWithPayInAmountAndDateFilter
);
router.get("/payin/company-name", logActivity, getPayInAmountByBrokerAndCompany);
router.get(
  "/payin/company-name/date-filter",
  logActivity,
  getPayInAmountByBrokerAndCompanyWithDateFilter
);

// payInPaymentStatus : "UnPaid and Partial"
router.get("/payin-unpaid-partial", logActivity, getBrokersWithUnpaidOrPartialPayInAmount);
router.get(
  "/payin-unpaid-partial/date-filter",
  logActivity,
  getBrokersWithUnpaidOrPartialPayInAmountAndDateFilter
);
router.get("/payin-unpaid-partial/company-name", logActivity, getUnpaidAndPartialPayInAmountByCompany);
router.get(
  "/payin-unpaid-partial/company-name/date-filter",
  logActivity,
  getUnpaidAndPartialPayInAmountByCompanyWithDate
);

// brokerBalance
router.get("/broker-balance", logActivity, getBrokerBalanceForAllBrokers);
router.get(
  "/broker-balance/date-filter",
  logActivity,
  getBrokerBalanceWithDateFilter
);
router.get("/broker-balance/company-name", logActivity, getBrokerBalanceByBrokerAndCompany);
router.get(
  "/broker-balance/company-name/date-filter",
  logActivity,
  getBrokerBalanceByBrokerAndCompanyWithDateFilter
);

export default router;
