import express from "express";
import {
  createCreditAndDebit,
  getCreditDetailsByBrokerId,
  getDebitDetailsByPartnerId,
  getCreditAndDebit,
  getCreditAndDebitById,
  updateCreditAndDebitById,
  deleteCreditAndDebitById,
  getCreditAndDebitByDateRangeAndBrokerName,
  getTotalAmountByDateRangeAndBrokerName,
  getCreditAndDebitByDateRangeAndPartnerId,
  getTotalAmountByDateRangeAndPartnerName,
} from "../../controller/accountsController/creditAndDebitController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Create Account
router.post("/", logActivity, createCreditAndDebit);

// Filter
router.get(
  "/broker-name",
  logActivity,
  getCreditAndDebitByDateRangeAndBrokerName
);

// Filter
router.get(
  "/partner-id",
  logActivity,
  getCreditAndDebitByDateRangeAndPartnerId
);

// total amount filter
router.get(
  "/total-amount",
  logActivity,
  getTotalAmountByDateRangeAndBrokerName
);

// total amount filter with partnerName
router.get(
  "/partner/total-amount",
  logActivity,
  getTotalAmountByDateRangeAndPartnerName
);

// Get All Account details
router.get("/", logActivity, getCreditAndDebit);

// Get All Details by BrokerId.
router.get("/broker-id/:brokerId", logActivity, getCreditDetailsByBrokerId);

// Get All Details by PartnerId.
router.get("/partner-id/:partnerId", logActivity, getDebitDetailsByPartnerId);

// Get Account by ID
router.get("/:id", logActivity, getCreditAndDebitById);

// Update Account
router.put("/:id", logActivity, updateCreditAndDebitById);

// Delete Account
router.delete("/:id", logActivity, deleteCreditAndDebitById);

export default router;
