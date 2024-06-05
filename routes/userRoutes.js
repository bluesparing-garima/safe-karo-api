import express from "express";
const router = express.Router();
import { userRegistration, userLogin } from "../controller/userController.js";

// Public Routes
router.post("/register", userRegistration);
router.post("/login", userLogin);

export default router;
