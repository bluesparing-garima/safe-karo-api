import express from 'express';
import { calculateODandTP } from '../controller/adminController/payOutController.js';

const router = express.Router();

// Endpoint for calculating OD and TP
router.get('/pay-out', calculateODandTP);

export default router;
