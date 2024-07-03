import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
  },
});

const OtpModel = mongoose.model("Otps", otpSchema);

export default OtpModel;
