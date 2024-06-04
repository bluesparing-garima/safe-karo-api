import expres from "express";
import {
    createNewRole, getAllRoles, updateRoles, deleteRoleByName
} from "../controller/addroleController.js";

const router = expres.Router();

// Create a new Role
router.post('/create/new-role', createNewRole);

// Get all Role  or filter by Role name
router.get('/get/all-roles', getAllRoles);

// Update a Role type by Name
router.post('/update/:roleName', updateRoles);

// Delete a Role type by Name
router.delete('/delete/role/:roleName', deleteRoleByName);

export default router;