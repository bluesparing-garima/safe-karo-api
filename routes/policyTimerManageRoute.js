import express from 'express';
import { getPolicyTimers } from '../controller/adminController/policyTimeMangerController.js';

const router = express.Router();

router.get('/', getPolicyTimers);

export default router;
