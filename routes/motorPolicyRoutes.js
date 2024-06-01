import express from 'express';
import { createMotorPolicy } from '../controller/motorPolicyController.js';

const router = express.Router();

// POST API to create a new motor policy
router.post('/motorPolicy', createMotorPolicy);

export default router;
