import express from "express";
import logActivity from "../../middlewares/logActivity.js";
import uploadSingleExcel from '../../middlewares/uploadSingleExcel.js';
import {
  createMotorPolicy,
  getMotorPolicies,
  getMotorPolicyByPartnerId,
  updateMotorPolicy,
  deactivateMotorPolicy,
  validatePolicyNumber,
  validateVehicleNumber,
  getMotorPolicyWithPaymentDetails,
  getMotorPolicyByPolicyId,
  getMotorPolicyByPolicyCompletedBy,
  uploadMotorPolicy,
  updateMotorPolicyDates,
  getMotorPoliciesByDateRange,
  getInactiveMotorPolicies 
} from "../../controller/policyController/motorPolicyController.js";
const router = express.Router();

router.post("/", logActivity, createMotorPolicy);
router.get("/", logActivity, getMotorPolicies);
router.get("/date-range",logActivity,getMotorPoliciesByDateRange);
router.get("/in-active",logActivity,getInactiveMotorPolicies);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.post("/upload", logActivity, uploadSingleExcel, uploadMotorPolicy);
router.put(
  "/update-motor-policy-dates-by-excel",
  logActivity,
  uploadSingleExcel,
  updateMotorPolicyDates
);
router.get("/policyId/:policyId", logActivity, getMotorPolicyByPolicyId);
router.get("/partner/:partnerId", logActivity, getMotorPolicyByPartnerId);
router.get(
  "/policy-completed-by/:policyCompletedBy",
  logActivity,
  getMotorPolicyByPolicyCompletedBy
);
router.put("/:id", logActivity, updateMotorPolicy);
router.delete("/:id", logActivity, deactivateMotorPolicy);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.get("/validateVehicleNumber", logActivity, validateVehicleNumber);

router.get(
  "/payment-details/:policyId",
  logActivity,
  getMotorPolicyWithPaymentDetails
);

export default router;