import expres from "express";
import {
    createCaseType, deleteCaseTypeById, updateCaseTypeById, getCaseTypeByName, getAllCaseTypes
} from "../controller/adminController/caseTypecontroller.js";

const router = expres.Router();

// Create a new case type
router.post('/', createCaseType);

// Get all case types or filter by case name
router.get('/', getAllCaseTypes);

// Get a case type by Name
router.get('/:caseType', getCaseTypeByName);

// Update a case type by Name
router.post('/:id', updateCaseTypeById);

// Delete a case type by Name
router.delete('/:id', deleteCaseTypeById);

export default router;