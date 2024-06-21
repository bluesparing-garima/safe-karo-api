import express from 'express';
import { createBooking, getAllBookings, updateBooking} from '../controller/adminController/bookingRequestController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', getAllBookings);
router.put('/:id', updateBooking);

export default router;
