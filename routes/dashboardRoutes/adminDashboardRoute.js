import express from "express";
import { getDashboardCount } from "../../controller/dashboard/adminDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Route for counting users by role
router.get("/", logActivity, getDashboardCount);

export default router;
