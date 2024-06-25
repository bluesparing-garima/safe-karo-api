import express from 'express';
import { getAgentDashboardCount } from '../controller/dashboard/agentDashboardController.js';

const router = express.Router();

router.get('/:partnerId', getAgentDashboardCount);

export default router;
