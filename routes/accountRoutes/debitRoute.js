import express from "express";
import {
  getAllDebits,
  getDebitsByPartnerId,
  getDebitsByPartnerIdAndDateRange,
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
export default router;
