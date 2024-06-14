// routes/userProfileRoutes.js
import express from "express";
import {
    createUserProfile,
    getUserProfileById,
    updateUserProfile,
    deleteUserProfile,
    getAllActiveUserProfiles
} from "../controller/adminController/userProfileController.js";

const router = express.Router();

// Route to create a new user profile
router.post("/", createUserProfile);

// Route to get a user profile by ID
router.get("/:id", getUserProfileById);

// Route to update a user profile by ID
router.put("/:id", updateUserProfile);

// Route to delete (deactivate) a user profile by ID
router.delete("/:id", deleteUserProfile);

// Route to get all active user profiles
router.get("/", getAllActiveUserProfiles);

export default router;
