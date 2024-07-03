import express from "express";
import {
  userRegistration,
  verifyEmail, // Import your verifyEmail function
  userLogin, // Import your userLogin function
  verifyAndCompleteLogin,
  resendOtp,
} from "../controller/userController.js";

const router = express.Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/register/verify", verifyEmail); // GET route for email verification
router.get("/login/verify", verifyAndCompleteLogin); // GET route for OTP verification
router.post("/resend-otp", resendOtp);

export default router;
