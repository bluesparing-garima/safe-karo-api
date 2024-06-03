import expres from "express";
import {
    createCaseType, deleteCaseTypeByName, updateCaseTypeByName, getCaseTypeByName, getAllCaseTypes
} from "../controller/caseTypecontroller.js";

const router = expres.Router();

// Create a new case type
router.post('/case-types', createCaseType);

// Get all case types or filter by case name
router.get('/case-types/get-all', getAllCaseTypes);

// Get a case type by Name
router.get('/case-types/get-with-name/:caseType', getCaseTypeByName);

// Update a case type by Name
router.post('/case-types/update/:caseType', updateCaseTypeByName);

// Delete a case type by Name
router.delete('/case-types/delete/:caseType', deleteCaseTypeByName);

export default router;