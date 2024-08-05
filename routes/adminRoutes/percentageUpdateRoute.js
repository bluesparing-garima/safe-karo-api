import {
  createPercentageData,
  updateCommissionByInputs,
} from "../../controller/adminController/percentageUpdateController.js";
import express from "express";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();
router.post("/percentage-update", logActivity, createPercentageData);
router.put(
  "/update",
  logActivity,
  updateCommissionByInputs
);
export default router;
