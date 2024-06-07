import express from 'express';
import {
  createRoles,
  getUserRoles,
  deleteUserByEmail,
  getUsersByRole,
  getAllUser,
  updateUserByEmail
} from "../controller/adminController/userRolesController.js";

const router = express.Router();

router.post('/', createRoles);
router.get("/:email", getUserRoles);
router.get("/", getAllUser);
router.get("/all/:roleName", getUsersByRole);
router.delete("/:email", deleteUserByEmail);
router.post("/:email", updateUserByEmail);

export default router;

