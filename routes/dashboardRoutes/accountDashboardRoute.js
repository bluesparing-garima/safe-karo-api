import express from "express";
import { getAccountDashboard } from "../../controller/dashboard/accountDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/", logActivity, getAccountDashboard);

export default router;
