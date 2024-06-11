import expres from "express";
import {
    createCaseType, deleteCaseType, updateCaseType, getCaseTypeByName, getAllCaseTypes,getCaseTypeById
} from "../controller/adminController/caseTypecontroller.js";

const router = expres.Router();

// Create a new case type
router.post('/', createCaseType);

// Get all case types or filter by case name
router.get('/', getAllCaseTypes);

// Get case types by ID
router.get('/:id', getCaseTypeById);

// Get a case type by Name
router.get('/:caseType', getCaseTypeByName);

// Update a case type by id
router.put('/:id', updateCaseType);

// Delete a case type by id
router.delete('/:id', deleteCaseType);

export default router;