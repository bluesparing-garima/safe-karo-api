import express from "express";
import {
  createRank,
  updateRank,
  getAllRanks,
  getPartnerCategory,
  deleteRank,
  getRankById,
} from "../../controller/adminController/rankController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.post("/", createRank, logActivity);
router.put("/:rankId", updateRank, logActivity);
router.get("/", getAllRanks, logActivity);
router.get("/:rankId", getRankById, logActivity);
router.get("/badge/:partnerId", getPartnerCategory, logActivity);
router.delete("/:rankId", deleteRank, logActivity);

export default router;
