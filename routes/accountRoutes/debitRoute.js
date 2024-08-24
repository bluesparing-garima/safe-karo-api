import express from "express";
import {
  getAllDebits,
  getDebitsByPartnerId,
  getDebitsByPartnerIdAndDateRange,
  getDebitDetailsByTransactionCodeAndPartnerId
} from "../../controller/accountsController/debitController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

router.get("/debits", logActivity, getAllDebits);
router.get("/debits/:partnerId", logActivity, getDebitsByPartnerId);
router.get(
  "/debit/date-range/:partnerId",
  logActivity,
  getDebitsByPartnerIdAndDateRange
);
router.get("/debit/transaction", logActivity, getDebitDetailsByTransactionCodeAndPartnerId);

export default router;
