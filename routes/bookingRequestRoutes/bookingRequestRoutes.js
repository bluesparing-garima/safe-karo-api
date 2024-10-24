import express from "express";
import {
  createBookingRequest,
  getAllBookingRequests,
  updateBookingRequest,
  validatePolicyNumber,
  getRejectedBookingRequests,
  getBookingRequestsByPartnerId,
  getBookingRequestsByCreatedBy,
  getBookingRequestsByAcceptedBy,
  getBookingRequestsByBookingId,
  acceptBookingRequest,
  getRejectedBookingRequestsByPartnerId,
  getAllBookingStatusAccepted,
  getBookingRequestsByRMId
} from "../../controller/bookingController/bookingRequestController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.post("/",logActivity, createBookingRequest);
router.get("/", logActivity, getAllBookingRequests);
router.get("/rejected-bookings",logActivity,getRejectedBookingRequests);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.get("/booking-id/:bookingId", logActivity, getBookingRequestsByBookingId);
router.get("/accepted-bookings",logActivity,getAllBookingStatusAccepted);
router.put("/accepted-booking/:id",logActivity, acceptBookingRequest);
router.get(
  "/created-by/:bookingCreatedBy",
  logActivity,
  getBookingRequestsByCreatedBy
);
router.get(
  "/accepted-by/:bookingAcceptedBy",
  logActivity,
  getBookingRequestsByAcceptedBy
);
router.get("/partner/:partnerId", logActivity, getBookingRequestsByPartnerId);
router.get("/relationship-manager",logActivity,getBookingRequestsByRMId);
router.get("/rejected-partner-id",logActivity,getRejectedBookingRequestsByPartnerId);
router.put("/:id", logActivity, updateBookingRequest);

export default router;
