import express from 'express';
import { countPoliciesByPartnerIdAndCategory } from '../controller/adminController/agentDashboardController.js';

const router = express.Router();

router.get('/:partnerId', countPoliciesByPartnerIdAndCategory);

export default router;
