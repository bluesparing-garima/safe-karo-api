import express from "express";
import {
  createBookingRequest,
  getAllBookingRequests, 
  updateBookingRequest,
  getBookingRequestsByPartnerId,
  getBookingRequestsByCreatedBy
 
} from "../controller/adminController/bookingRequestController.js";

const router = express.Router();

router.post("/", createBookingRequest);
router.get("/", getAllBookingRequests);
router.get("/created-by/:created-by", getBookingRequestsByCreatedBy); 
router.get("/partner/:partnerId", getBookingRequestsByPartnerId);
router.put("/:id", updateBookingRequest);

export default router;
