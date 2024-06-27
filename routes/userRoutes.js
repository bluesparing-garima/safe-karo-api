import express from "express";
const router = express.Router();
import { userRegistration, userLogin } from "../controller/userController.js";
import logActivity from "../middlewares/logActivity.js";
// Public Routes
router.post("/register", logActivity, userRegistration);
router.post("/login", logActivity, userLogin);

export default router;
