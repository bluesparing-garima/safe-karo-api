import express from "express";
import {
    createMotorPolicy,
    getMotorPolicies,
    deleteMotorPolicy,
    getMotorPolicyById,
    updateMotorPolicy
} from "../controller/policyController/motorPolicyController.js";

const router = express.Router();

router.post("/", createMotorPolicy);
router.get("/", getMotorPolicies);
router.get("/:partnerId", getMotorPolicyById);
router.put("/:id", updateMotorPolicy);
router.delete("/:id", deleteMotorPolicy);

export default router;
