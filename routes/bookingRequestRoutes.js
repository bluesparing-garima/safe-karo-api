import express from "express";
import {
  createBookingRequest,
  getAllBookingRequests, 
  updateBookingRequest,
  validatePolicyNumber,
  getBookingRequestsByPartnerId,
  getBookingRequestsByCreatedBy
 
} from "../controller/bookingController/bookingRequestController.js";

const router = express.Router();

router.post("/", createBookingRequest);
router.get("/", getAllBookingRequests);
router.get('/validatePolicyNumber',validatePolicyNumber);
router.get("/created-by/:bookingCreatedBy", getBookingRequestsByCreatedBy); 
router.get("/partner/:partnerId", getBookingRequestsByPartnerId);
router.put("/:id", updateBookingRequest);

export default router;
