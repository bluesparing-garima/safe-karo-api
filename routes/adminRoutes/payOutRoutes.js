import express from "express";
import { calculateODandTP } from "../../controller/adminController/payOutController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Endpoint for calculating OD and TP
router.get("/pay-out", logActivity, calculateODandTP);

export default router;
