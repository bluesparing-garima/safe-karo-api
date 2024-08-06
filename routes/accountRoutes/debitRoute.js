import express from "express";
import {
  getDebitsByPartnerId,
  getDebitsByPartnerIdAndDateRange,
} from "../../controller/accountsController/debitController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Route to get debits by partnerId
router.get("/debits/:partnerId", logActivity, getDebitsByPartnerId);

router.get(
  "/debit/date-range/:partnerId",
  logActivity,
  getDebitsByPartnerIdAndDateRange
);
export default router;
