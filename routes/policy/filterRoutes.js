import { getPoliciesByDateRange } from "../../controller/policyController/filterController.js";
import express from "express";

const router = express.Router();
router.get("/policies/date-range", getPoliciesByDateRange);

export default router;