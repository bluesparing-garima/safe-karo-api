import express from "express";
import { getRMDashboardCount } from "../../controller/dashboard/relationShipManagerController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Route for counting users by role
router.get("/", logActivity, getRMDashboardCount);

export default router;
