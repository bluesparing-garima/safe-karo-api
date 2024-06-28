import express from "express";
import {
  createBookingRequest,
  getAllBookingRequests,
  updateBookingRequest,
  validatePolicyNumber,
  getBookingRequestsByPartnerId,
  getBookingRequestsByCreatedBy,
} from "../../controller/bookingController/bookingRequestController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.post("/", logActivity, createBookingRequest);
router.get("/", logActivity, getAllBookingRequests);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.get(
  "/created-by/:bookingCreatedBy",
  logActivity,
  getBookingRequestsByCreatedBy
);
router.get("/partner/:partnerId", logActivity, getBookingRequestsByPartnerId);
router.put("/:id", logActivity, updateBookingRequest);

export default router;
