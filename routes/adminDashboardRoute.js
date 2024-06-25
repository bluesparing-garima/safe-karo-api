import express from 'express';
import { getDashboardCount } from '../controller/dashboard/adminDashboardController.js';

const router = express.Router();

// Route for counting users by role
router.get('/', getDashboardCount);

export default router;
