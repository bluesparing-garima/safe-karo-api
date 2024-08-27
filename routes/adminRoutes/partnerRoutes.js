import express from "express";
import {
  uploadPartnerExcel,
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
} from "../../controller/adminController/partnerController.js";
import uploadSingleExcel from '../../middlewares/uploadSingleExcel.js';
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.post("/upload-excel",logActivity,uploadSingleExcel,uploadPartnerExcel);
router.post("/", logActivity, createPartner);
router.get("/", logActivity, getAllPartners);
router.get("/:id", logActivity, getPartnerById);
router.put("/:id", logActivity, updatePartner);
router.delete("/:id", logActivity, deletePartner);

export default router;