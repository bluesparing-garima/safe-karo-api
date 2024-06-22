import express from 'express';
import { createBookingRequest, getAllBookings, updateBooking,checkPolicyNumberExists} from '../controller/adminController/bookingRequestController.js';

const router = express.Router();

router.post('/', createBookingRequest);
router.get('/', getAllBookings);
router.put('/:id', updateBooking);
router.get('/:policyNumber', checkPolicyNumberExists);
export default router;
