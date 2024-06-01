import express from 'express';
import {
  createRoles,
  getUserRoles,
  deleteUserByEmail,
  getUsersByRole,
  getAllUser,
  updateUserByEmail
} from "../controller/rolesController.js";

const router = express.Router();

router.post('/createRoles', createRoles);
router.get("/user/:email", getUserRoles);
router.get("/getalluser", getAllUser);
router.get("/getalluserbyroles", getUsersByRole);
router.delete("/delete/user/:email", deleteUserByEmail);
router.post("/update/user/:email", updateUserByEmail);

export default router;

