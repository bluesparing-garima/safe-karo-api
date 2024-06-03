import expres from "express";
import {
  createPolicyType,
  getAllPolicyTypes,
  getPolicyTypeByName,
  updatePolicyTypeByName,
  deletePolicyTypeByName,
} from "../controller/policyTypeController.js";

const router = expres.Router();

// Create a new policy type
router.post('/policy-types', createPolicyType);

// Get all policy types or filter by policy name
router.get('/policy-types/get-all', getAllPolicyTypes);

// Get a policy type by Name
router.get('/policy-types/get-with-name/:policyType', getPolicyTypeByName);

// Update a policy type by Name
router.post('/policy-types/update/:policyType', updatePolicyTypeByName);

// Delete a policy type by Name
router.delete('/policy-types/delete/:policyType', deletePolicyTypeByName);

export default router;