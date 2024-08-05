import {
  createPercentageData,
} from "../../controller/adminController/percentageUpdateController.js";
import express from "express";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();
router.put("/update", logActivity, createPercentageData);
export default router;
