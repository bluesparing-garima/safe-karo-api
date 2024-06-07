import expres from "express";
import {
  createPolicyType,
  getAllPolicyTypes,
  getPolicyTypeByName,
  updatePolicyTypeById,
  deletePolicyTypeById
} from "../controller/adminController/policyTypeController.js";

const router = expres.Router();

// Create a new policy type
router.post('/', createPolicyType);

// Get all policy types or filter by policy name
router.get('/', getAllPolicyTypes);

// Get a policy type by Name
router.get('/:policyType', getPolicyTypeByName);

// Update a policy type by Name
router.post('/:id', updatePolicyTypeById);

// Delete a policy type by Name
router.delete('/:id', deletePolicyTypeById);

export default router;