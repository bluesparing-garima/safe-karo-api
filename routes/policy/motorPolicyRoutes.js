import express from "express";
import {
  createMotorPolicy,
  getMotorPolicies,
  deleteMotorPolicy,
  updateMotorPolicy,
  validatePolicyNumber,
  getMotorPolicyByPartnerId,
  getMotorPolicyByBookingId,
} from "../../controller/policyController/motorPolicyController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.post("/", logActivity, createMotorPolicy);
router.get("/", logActivity, getMotorPolicies);
router.get("/booking-id/:bookingId", logActivity, getMotorPolicyByBookingId);
router.get("/:partnerId", logActivity, getMotorPolicyByPartnerId);
router.get("/validatePolicyNumber", logActivity, validatePolicyNumber);
router.put("/:id", logActivity, updateMotorPolicy);
router.delete("/:id", logActivity, deleteMotorPolicy);

export default router;
