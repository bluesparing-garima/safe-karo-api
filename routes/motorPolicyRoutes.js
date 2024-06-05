// routes/motorPolicyRoutes.js
import express from 'express';
import uploadMiddleware from '../middlewares/uploadMiddleware .js';
import { createMotorPolicy, getMotorPolicies, deleteMotorPolicyById, getMotorPolicyById, updateMotorPolicyById } from '../controller/motorPolicyController.js';

const router = express.Router();

router.post('/', uploadMiddleware, createMotorPolicy);
router.get('/', getMotorPolicies);
router.delete('/:id', deleteMotorPolicyById)
router.get('/:id', getMotorPolicyById);
router.post('/:id',uploadMiddleware, updateMotorPolicyById)

export default router;
