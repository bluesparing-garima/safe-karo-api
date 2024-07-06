import express from 'express';
import logActivity from "../../middlewares/logActivity.js";
import {
  createMotorPolicyPayment,
  getAllMotorPolicyPayments,
  getMotorPolicyPaymentByPolicyId,
  updateMotorPolicyPayment,
  deleteMotorPolicyPayment,
} from '../../controller/policyController/motorPolicyPaymentController.js';

const router = express.Router();
router.put('/:policyId', logActivity, updateMotorPolicyPayment);
router.post('/', logActivity, createMotorPolicyPayment);
router.get('/', logActivity, getAllMotorPolicyPayments);
router.get('/:policyId', logActivity, getMotorPolicyPaymentByPolicyId);
router.delete('/:id', logActivity, deleteMotorPolicyPayment);

export default router;
