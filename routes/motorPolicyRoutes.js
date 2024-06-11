import express from "express";
import {
    createMotorPolicy,
    getMotorPolicies,
    deleteMotorPolicyById,
    getMotorPolicyById,
    updateMotorPolicyById
} from "../controller/policyController/motorPolicyController.js";

const router = express.Router();

router.post("/", createMotorPolicy);
router.get("/", getMotorPolicies);
router.get("/:id", getMotorPolicyById);
router.put("/:id", updateMotorPolicyById);
router.delete("/:id", deleteMotorPolicyById);

export default router;
