import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userSchema.js";
import Otps from "../models/otpModel.js";
import randomstring from "randomstring";
import sendEmail from "../utils/sendEmails.js";

// Function to generate a 6-digit numeric OTP
function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
}

// User Registration
const userRegistration = async (req, res) => {
  const { name, email, password, phoneNumber, partnerId, role } = req.body;
  try {
    // Check if email already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email already exists" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user with isActive set to false
    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
      phoneNumber,
      role,
      partnerId,
      isActive: false,
    });

    await newUser.save();

    const otp = generateOTP();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);

    // Save OTP to database
    const newOTP = new Otps({ email, otp, expiresAt: expirationTime });
    await newOTP.save();
    console.log("newOTP", newOTP);
    const verificationLink = `http://localhost:3000/verify/email?otp=${otp}&email=${email}`;

    await sendEmail({
      to: email,
      subject: "Email Verification",
      otp: otp,
      verificationLink: verificationLink,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      email,
    });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to Register" });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  const { otp, email } = req.query;
  console.log("Received OTP:", otp);
  console.log("Received Email:", email);
  try {
    if (!otp || !email) {
      return res
        .status(400)
        .json({ status: "failed", message: "OTP and Email are required" });
    }
    const existingOTP = await Otps.findOne({ otp:otp,email:email });
    console.log(existingOTP);

    if (!existingOTP) {
      return res.status(400).json({ status: "failed", message: "Invalid OTP" });
    }

    if (existingOTP.expiresAt < new Date()) {
      await Otps.findOneAndDelete({ otp,email });
      return res
        .status(400)
        .json({ status: "failed", message: "OTP has expired" });
    }

    const user = await UserModel.findOneAndUpdate(
      { email: email },
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(400)
        .json({ status: "failed", message: "User not found" });
    }

    // Redirect to login page after successful verification
    return res.redirect("http://localhost:3000/login"); // Adjust the URL as per your frontend route
  } catch (error) {
    console.error("Error during email verification:", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Unable to verify email" });
  }
};

// User Login
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "failed", message: "All Fields are Required" });
    }

    const user = await UserModel.findOne({ email: email, isActive: true }); // Ensure user is active
    if (!user) {
      return res
        .status(400)
        .json({ status: "failed", message: "You are not a Registered User" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email or Password is not Valid" });
    }

    const otp = generateOTP();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10); // OTP valid for 10 minutes
    const newOTP = new Otps({ email, otp, expiresAt: expirationTime });
    await newOTP.save();

    await sendEmail({
      to: email,
      subject: "Your OTP for Login",
      otp: otp,
    });

    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", email });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to Login" });
  }
};

// Verify OTP and complete login
const verifyAndCompleteLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const existingOTP = await Otps.findOneAndDelete({ email, otp });

    if (!existingOTP || existingOTP.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await UserModel.findOne({ email, isActive: true });

    if (!user) {
      return res
        .status(400)
        .json({ status: "failed", message: "You are not a Registered User" });
    }

    res.redirect("http://localhost:3000/dashboard"); // Redirect to dashboard
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to Login" });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ status: "failed", message: "Email not registered" });
    }

    const otp = generateOTP();
    const newOTP = new Otps({ email, otp });
    await newOTP.save();

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: "Your OTP",
      message: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    res
      .status(200)
      .json({ success: true, message: "OTP resent successfully", email });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to resend OTP" });
  }
};

export {
  userRegistration,
  userLogin,
  verifyAndCompleteLogin,
  resendOtp,
  verifyEmail,
};
