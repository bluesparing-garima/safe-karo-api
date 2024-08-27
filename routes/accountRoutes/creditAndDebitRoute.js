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
  getTotalAmountByDateRangeAndPartnerId,
  getCreditAndDebitDetailsByTransactionCodeAndPartnerId,
} from "../../controller/accountsController/creditAndDebitController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Create Account
router.post("/", logActivity, createCreditAndDebit);

// Get All Details by BrokerId
router.get("/broker-id", logActivity, getCreditDetailsByBrokerId);

// Get All Details by PartnerId
router.get("/partner-id", logActivity, getDebitDetailsByPartnerId);

// Get Credit and Debit Details by Transaction Code and PartnerId
router.get("/transaction", logActivity, getCreditAndDebitDetailsByTransactionCodeAndPartnerId);

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

// Total amount filter
router.get(
  "/total-amount",
  logActivity,
  getTotalAmountByDateRangeAndBrokerName
);

// Total amount filter with PartnerName
router.get(
  "/partner/total-amount",
  logActivity,
  getTotalAmountByDateRangeAndPartnerId
);

// Get All Account details
router.get("/", logActivity, getCreditAndDebit);

// Get Account by ID
router.get("/:id", logActivity, getCreditAndDebitById);

// Update Account
router.put("/:id", logActivity, updateCreditAndDebitById);

// Delete Account
router.delete("/:id", logActivity, deleteCreditAndDebitById);

export default router;
