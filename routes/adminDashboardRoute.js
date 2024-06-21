import express from 'express';
import { countUsersByRole } from '../controller/adminController/adminDashboardController.js';

const router = express.Router();

// Route for counting users by role
router.get('/', countUsersByRole);

export default router;
