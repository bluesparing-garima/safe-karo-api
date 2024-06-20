import express from "express";
import {
    createMotorPolicy,
    getMotorPolicies,
    deleteMotorPolicy,
    updateMotorPolicy,
    getMotorPolicyByPolicyNumber
} from "../controller/policyController/motorPolicyController.js";

const router = express.Router();

router.post("/", createMotorPolicy);
router.get("/", getMotorPolicies);
router.get('/:policyNumber',getMotorPolicyByPolicyNumber);
router.put("/:id", updateMotorPolicy);
router.delete("/:id", deleteMotorPolicy);

export default router;
