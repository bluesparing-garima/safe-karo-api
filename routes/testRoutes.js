import express from "express";
import {
  uploadFilesAndData,
  createMotorPolicy,
  createBookingRequest,
} from "../controller/fileController.js";

const router = express.Router();

router.post("/test", uploadFilesAndData);
router.post("/test/policy/motor", createMotorPolicy);
router.post("/test/booking-request", createBookingRequest);
export default router;
