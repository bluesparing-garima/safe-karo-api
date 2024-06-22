import express from 'express';
import { createBookingRequest, getAllBookingsRequest, updateBookingRequest,checkPolicyNumberExists} from '../controller/adminController/bookingRequestController.js';

const router = express.Router();

router.post('/', createBookingRequest);
router.get('/', getAllBookingsRequest);
router.put('/:id', updateBookingRequest);
router.get('/:policyNumber', checkPolicyNumberExists);
export default router;
