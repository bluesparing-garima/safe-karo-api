import expres from "express";
import {
    createNewRole, getAllRoles, updateRoles, deleteRoleById, getRolesById
} from "../controller/addroleController.js";

const router = expres.Router();

// Create a new Role
router.post('/', createNewRole);

// Get all Role  or filter by Role name
router.get('/', getAllRoles);

// Update a Role type by Name
router.post('/:id', updateRoles);

// Delete a Role type by Name
router.delete('/:id', deleteRoleById);

//get role by ID
router.get('/:id', getRolesById);

export default router;