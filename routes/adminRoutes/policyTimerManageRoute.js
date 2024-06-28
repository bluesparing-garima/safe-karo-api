import express from "express";
import { getPolicyTimers } from "../../controller/adminController/policyTimeMangerController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.get("/", logActivity, getPolicyTimers);

export default router;
