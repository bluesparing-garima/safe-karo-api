import expres from "express";
import {
  createPolicyType,
  getAllPolicyTypes,
  getPolicyTypeByName,
  getPolicyTypeById,
  updatePolicyType,
  deletePolicyType
} from "../controller/adminController/policyTypeController.js";

const router = expres.Router();

// Create a new policy type
router.post('/', createPolicyType);

// Get all policy types or filter by policy name
router.get('/', getAllPolicyTypes);

// Get a policy type by Name
router.get('/:policyType', getPolicyTypeByName);

// Get policy type by ID
router.get('/:id',getPolicyTypeById)

// Update a policy type by id
router.put('/:id', updatePolicyType);

// Delete a policy type by Name
router.delete('/:id', deletePolicyType);

export default router;