import express from "express";
import {
  userRegistration,
  verifyEmail,
  userLogin,
  verifyAndCompleteLogin,
  resendOtp,
} from "../controller/userController.js";

const router = express.Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/register/verify", verifyEmail);
router.post("/login/verify", verifyAndCompleteLogin);
router.post("/resend-otp", resendOtp);

export default router;
