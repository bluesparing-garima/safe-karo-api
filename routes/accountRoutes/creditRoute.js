import express from "express";
import {
    getAllCredits,
  getCreditsByPartnerId,
  getCreditsByPartnerIdAndDateRange,
  getDCreditDetailsByTransactionCodeAndBrokerId
} from "../../controller/accountsController/creditController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

router.get("/credits", logActivity, getAllCredits);
router.get("/credits/:partnerId", logActivity, getCreditsByPartnerId);
router.get(
  "/credits/date-range/:partnerId",
  logActivity,
  getCreditsByPartnerIdAndDateRange
);
router.get("/credits/transaction", logActivity, getDCreditDetailsByTransactionCodeAndBrokerId);

export default router;
