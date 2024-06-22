import express from 'express';
import { createBookingRequest, getAllBookingRequests, updateBookingRequest,checkPolicyNumberExists} from '../controller/adminController/bookingRequestController.js';

const router = express.Router();

router.post('/', createBookingRequest);
router.get('/', getAllBookingRequests);
router.put('/:id', updateBookingRequest);
router.get('/:policyNumber', checkPolicyNumberExists);
export default router;
