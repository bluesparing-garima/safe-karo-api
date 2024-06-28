import expres from "express";
import {
  createCaseType,
  deleteCaseType,
  updateCaseType,
  getCaseTypeByName,
  getAllCaseTypes,
  getCaseTypeById,
} from "../../controller/adminController/caseTypecontroller.js";
import logActivity from "../../middlewares/logActivity.js";
const router = expres.Router();

// Create a new case type
router.post("/", logActivity, createCaseType);

// Get all case types or filter by case name
router.get("/", logActivity, getAllCaseTypes);

// Get case types by ID
router.get("/:id", logActivity, getCaseTypeById);

// Get a case type by Name
router.get("/:caseType", logActivity, getCaseTypeByName);

// Update a case type by id
router.put("/:id", logActivity, updateCaseType);

// Delete a case type by id
router.delete("/:id", logActivity, deleteCaseType);

export default router;
