import expres from "express";
import {
  createNewRole,
  getAllRoles,
  updateRoles,
  deleteRole,
  getRolesById,
} from "../../controller/adminController/roleController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = expres.Router();

// Create a new Role
router.post("/", logActivity, createNewRole);

// Get all Role  or filter by Role name
router.get("/", logActivity, getAllRoles);

// Update a Role type by id
router.put("/:id", logActivity, updateRoles);

// Delete a Role type by id
router.delete("/:id", logActivity, deleteRole);

//get role by ID
router.get("/:id", logActivity, getRolesById);

export default router;
