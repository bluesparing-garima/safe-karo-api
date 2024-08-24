import express from "express";
import { getOperationDashboardCount } from "../../controller/dashboard/operationDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/:leadCreatedBy", logActivity, getOperationDashboardCount);

export default router;
