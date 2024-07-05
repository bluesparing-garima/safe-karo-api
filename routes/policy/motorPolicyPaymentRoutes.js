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

router.post('/', logActivity, createMotorPolicyPayment);
router.get('/', logActivity, getAllMotorPolicyPayments);
router.get('/:policyId', logActivity, getMotorPolicyPaymentByPolicyId);
router.put('/:id', logActivity, updateMotorPolicyPayment);
router.delete('/:id', logActivity, deleteMotorPolicyPayment);

export default router;
