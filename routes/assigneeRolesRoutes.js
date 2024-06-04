import express from 'express';
import {
  createRoles,
  getUserRoles,
  deleteUserByEmail,
  getUsersByRole,
  getAllUser,
  updateUserByEmail
} from "../controller/assigneeRolesController.js";

const router = express.Router();

router.post('/', createRoles);
router.get("/:id", getUserRoles);
router.get("/", getAllUser);
router.get("/:rolename", getUsersByRole);
router.delete("/:id", deleteUserByEmail);
router.post("/:id", updateUserByEmail);

export default router;

