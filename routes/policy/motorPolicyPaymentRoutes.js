import express from 'express';
import logActivity from "../../middlewares/logActivity.js";
import {
  createMotorPolicyPayment,
  getAllMotorPolicyPayments,
  getMotorPolicyPaymentByPolicyId,
  updateMotorPolicyPayment,
  deleteMotorPolicyPayment,
  policyStatusManage,
  getUnPaidAndPartialPaidPayments,
  getPaidPayments

} from '../../controller/policyController/motorPolicyPaymentController.js';

const router = express.Router();
router.post('/', logActivity, createMotorPolicyPayment);
router.get('/', logActivity, getAllMotorPolicyPayments);
router.get('/partner-id/status', logActivity, getUnPaidAndPartialPaidPayments);
router.get('/partner-id/paid-status', logActivity, getPaidPayments);
router.get('/:policyId', logActivity, getMotorPolicyPaymentByPolicyId);
router.put('/status-manage',logActivity,policyStatusManage);
router.put('/:policyId', logActivity, updateMotorPolicyPayment);
router.delete('/:id', logActivity, deleteMotorPolicyPayment);

export default router;
