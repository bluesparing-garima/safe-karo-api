import express from "express";
import {
    createAccountManage,
  getAccountDetailsByBrokerId,
  getAccountDetailsByPartnerId,
  getAccountManage,
  getAccountManageById,
  updateAccountManageById,
  deleteAccountManageById,
  getAccountDetailsByDateRangeAndBrokerName,
  getTotalAmountByDateRangeAndBrokerName,
  getAccountDetailsByDateRangeAndPartnerId,
  getTotalAmountByDateRangeAndPartnerId,
} from "../../controller/accountsController/accountManageController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Create Account
router.post("/", logActivity, createAccountManage);

// Get All Details by BrokerId.
router.get("/broker-id", logActivity, getAccountDetailsByBrokerId);

// Get All Details by PartnerId.
router.get("/partner-id", logActivity, getAccountDetailsByPartnerId);

// Filter
router.get(
  "/broker-name",
  logActivity,
  getAccountDetailsByDateRangeAndBrokerName
);

// Filter
router.get(
  "/partner-id",
  logActivity,
  getAccountDetailsByDateRangeAndPartnerId
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
  getTotalAmountByDateRangeAndPartnerId
);

// Get All Account details
router.get("/", logActivity, getAccountManage);

// Get Account by ID
router.get("/:id", logActivity, getAccountManageById);

// Update Account
router.put("/:id", logActivity, updateAccountManageById);

// Delete Account
router.delete("/:id", logActivity, deleteAccountManageById);

export default router;