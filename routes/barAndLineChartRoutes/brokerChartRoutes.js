import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import {
    getDataByTimeframeAndBroker,
} from "../../controller/barAndLineChartController.js/brokerDashboardChartController.js";

const router = express.Router();
router.get("/broker", logActivity, getDataByTimeframeAndBroker);

export default router;
