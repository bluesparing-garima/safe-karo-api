import express from "express";
import {
    createMotorPolicy,
    getMotorPolicies,
    deleteMotorPolicy,
    getMotorPolicyById,
    updateMotorPolicy,
    getMotorPolicyByPolicyNumber
} from "../controller/policyController/motorPolicyController.js";

const router = express.Router();

router.post("/", createMotorPolicy);
router.get("/", getMotorPolicies);
router.get("/:partnerId", getMotorPolicyById);
router.get('/:policyNumber',getMotorPolicyByPolicyNumber);
router.put("/:id", updateMotorPolicy);
router.delete("/:id", deleteMotorPolicy);

export default router;
