import express from "express";
import {
    createMotorPolicy,
    getMotorPolicies,
    deleteMotorPolicy,
    updateMotorPolicy,
    validatePolicyNumber,
    getMotorPolicyByPartnerId
} from "../controller/policyController/motorPolicyController.js";

const router = express.Router();

router.post("/", createMotorPolicy);
router.get("/", getMotorPolicies);
router.get('/validatePolicyNumber',validatePolicyNumber);
router.get("/:partnerId",getMotorPolicyByPartnerId);
router.put("/:id", updateMotorPolicy);
router.delete("/:id", deleteMotorPolicy);

export default router;
