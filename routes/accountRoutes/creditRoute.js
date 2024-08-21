import express from "express";
import {
    getAllCredits,
    getCreditsByBrokerId,
    getCreditsByBrokerIdAndDateRange,
  getDCreditDetailsByTransactionCodeAndBrokerId
} from "../../controller/accountsController/creditController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

router.get("/", logActivity, getAllCredits);
router.get("/:brokerId", logActivity, getCreditsByBrokerId);
router.get(
  "/date-range/:brokerId",
  logActivity,
  getCreditsByBrokerIdAndDateRange
);
router.get("/transactions", logActivity, getDCreditDetailsByTransactionCodeAndBrokerId);

export default router;