import express from "express";
import {
  createNewsLetterPost,
  getAllNewsLetters,
  getNewsLettersByCategory,
  getNewsLettersByWebsite,
  getNewsLetterPostById,
  updateNewsLetterPostById,
  deleteNewsLetterPostById,
} from "../../controller/websiteController/newsLetterController.js";
import logActivity from "../../middlewares/logActivity.js";

const router = express.Router();

// Route for creating a new NewsLetter post
router.post("/", createNewsLetterPost, logActivity);

// Route for fetching all NewsLetter posts (optionally filtered by website)
router.get("/", getAllNewsLetters, logActivity);

// Route for fetching NewsLetters by category
router.get("/category", getNewsLettersByCategory, logActivity);

// Route for fetching NewsLetters by website
router.get("/website", getNewsLettersByWebsite, logActivity);

// Route for fetching a single NewsLetter post by ID
router.get("/:id", getNewsLetterPostById, logActivity);

// Route for updating a NewsLetter post by ID
router.put("/:id", updateNewsLetterPostById, logActivity);

// Route for deleting a NewsLetter post by ID
router.delete("/:id", deleteNewsLetterPostById, logActivity);

export default router;
