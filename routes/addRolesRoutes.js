import expres from "express";
import {
    createNewRole, getAllRoles, updateRoles, deleteRoleById
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

export default router;