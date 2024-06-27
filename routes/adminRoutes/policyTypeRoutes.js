import expres from "express";
import {
  createPolicyType,
  getAllPolicyTypes,
  getPolicyTypeByName,
  getPolicyTypeById,
  updatePolicyType,
  deletePolicyType,
} from "../../controller/adminController/policyTypeController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = expres.Router();

// Create a new policy type
router.post("/", logActivity, createPolicyType);

// Get all policy types or filter by policy name
router.get("/", logActivity, getAllPolicyTypes);

// Get Policy by ID
router.get("/:id", logActivity, getPolicyTypeById);

// Get a policy type by Name
router.get("/:policyType", logActivity, getPolicyTypeByName);

// Get policy type by ID
router.get("/:id", logActivity, getPolicyTypeById);

router.put("/:id", logActivity, updatePolicyType);

// Delete a policy type by Name
router.delete("/:id", logActivity, deletePolicyType);

export default router;
