import express from "express";
import {
  createBookingRequest,
  getAllBookingRequests,
  updateBookingRequest,
  checkPolicyNumberExists,
  getBookingRequestsByPartnerId,
} from "../controller/adminController/bookingRequestController.js";

const router = express.Router();

router.post("/", createBookingRequest);
router.get("/", getAllBookingRequests);
router.get("/:partnerId", getBookingRequestsByPartnerId);
router.get("/:policyNumber", checkPolicyNumberExists);
router.put("/:id", updateBookingRequest);
export default router;
