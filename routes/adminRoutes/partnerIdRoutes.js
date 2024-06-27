// routes/partnerIdRoutes.js
import express from "express";
import {
  uploadPartnerIdExcel,
  getAllPartners,
} from "../../controller/adminController/partnerController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

// Define routes
router.post("/", logActivity, uploadPartnerIdExcel);
router.get("/", logActivity, getAllPartners);

export default router;
