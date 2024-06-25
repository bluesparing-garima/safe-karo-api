import express from "express";
import {
  createBookingRequest,
  getAllBookingRequests,
  updateBookingRequest,
  validatePolicyNumber,
  getBookingRequestsByPartnerId,
} from "../controller/bookingController/bookingRequestController.js";

const router = express.Router();

router.post("/", createBookingRequest);
router.get("/", getAllBookingRequests);
router.get("/policyNumber", validatePolicyNumber);
router.get("/:partnerId", getBookingRequestsByPartnerId);
router.put("/:id", updateBookingRequest);
export default router;
