import express from "express";
import { calculateODandTP } from "../../controller/adminController/payInController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Endpoint for calculating OD and TP
router.get("/pay-in", logActivity, calculateODandTP);

export default router;
