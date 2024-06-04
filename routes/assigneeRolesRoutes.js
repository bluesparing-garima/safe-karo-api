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

router.post('/new/roles', createRoles);
router.get("/user/:email", getUserRoles);
router.get("/getalluser", getAllUser);
router.get("/getall/user/with-role-name", getUsersByRole);
router.delete("/user/delete/:email", deleteUserByEmail);
router.post("/update/user/role/:email", updateUserByEmail);

export default router;

