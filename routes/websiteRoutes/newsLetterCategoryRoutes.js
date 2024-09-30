import express from "express";
import {
  createNewsLetterCategory,
  getAllNewsLetterCategories,
  getNewsLetterCategoryById,
  updateNewsLetterCategoryById,
  deleteNewsLetterCategoryById,
} from "../../controller/websiteController/newsLetterCategoryController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

router.post("/", createNewsLetterCategory, logActivity);
router.get("/", getAllNewsLetterCategories, logActivity);
router.get("/:id", getNewsLetterCategoryById, logActivity);
router.put("/:id", updateNewsLetterCategoryById, logActivity);
router.delete("/:id", deleteNewsLetterCategoryById, logActivity);

export default router;
