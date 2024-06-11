import expres from "express";
import {
    createNewRole, getAllRoles, updateRoles, deleteRole, getRolesById
} from "../controller/adminController/roleController.js";

const router = expres.Router();

// Create a new Role
router.post('/', createNewRole);

// Get all Role  or filter by Role name
router.get('/', getAllRoles);

// Update a Role type by id
router.put('/:id', updateRoles);

// Delete a Role type by id
router.delete('/:id', deleteRole);

//get role by ID
router.get('/:id', getRolesById);

export default router;