import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import {
  createMotorPolicy,
  getMotorPolicies,
  getMotorPolicyByPartnerId,
  updateMotorPolicy,
  deleteMotorPolicy,
  validatePolicyNumber,
  validateVehicleNumber,
  getMotorPolicyWithPaymentDetails,
  getMotorPolicyByPolicyId,
  getMotorPolicyByPolicyCompletedBy,
  updatePaymentStatusAndAmount,
  uploadMotorPolicy
} from "../../controller/policyController/motorPolicyController.js";
const router = express.Router();

router.post("/", logActivity, createMotorPolicy);
router.post("/update-payment-status", logActivity, updatePaymentStatusAndAmount);
router.get("/", logActivity, getMotorPolicies);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.post('/upload',logActivity,uploadMotorPolicy);
router.get("/policyId/:policyId", logActivity, getMotorPolicyByPolicyId);
router.get("/partner/:partnerId", logActivity, getMotorPolicyByPartnerId);
router.get("/policy-completed-by/:policyCompletedBy", logActivity,getMotorPolicyByPolicyCompletedBy);
router.put("/:id", logActivity, updateMotorPolicy);
router.delete("/:id", logActivity, deleteMotorPolicy);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.get("/validateVehicleNumber", logActivity, validateVehicleNumber);

router.get(
  "/payment-details/:policyId",
  logActivity,
  getMotorPolicyWithPaymentDetails
);

export default router;
