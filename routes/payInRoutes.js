import express from 'express';
import { calculateODandTP } from '../controller/adminController/payInController.js';

const router = express.Router();

// Endpoint for calculating OD and TP
router.get('/pay-in', calculateODandTP);

export default router;
