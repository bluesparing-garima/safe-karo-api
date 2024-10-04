import express from "express";
import  { getHRDashboardCount }  from "../../controller/dashboard/hrDashboardController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/", logActivity, getHRDashboardCount);
export default router;
