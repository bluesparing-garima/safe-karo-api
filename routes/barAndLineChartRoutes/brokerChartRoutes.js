import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import {
    getPayOutCommissionByBroker,
} from "../../controller/barAndLineChartController.js/brokerDashboardChartController.js";

const router = express.Router();
router.get("/broker", logActivity, getPayOutCommissionByBroker);

export default router;
