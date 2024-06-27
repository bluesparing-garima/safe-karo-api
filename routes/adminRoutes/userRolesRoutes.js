import express from "express";
import {
  createRoles,
  getUserRoles,
  deleteUserByEmail,
  getUsersByRole,
  getAllUser,
  updateUserByEmail,
} from "../../controller/adminController/userRolesController.js";
import logActivity from "../../middlewares/logActivity.js";
const router = express.Router();

router.post("/", logActivity, createRoles);
router.get("/:email", logActivity, getUserRoles);
router.get("/", logActivity, getAllUser);
router.get("/all/:roleName", logActivity, getUsersByRole);
router.delete("/:email", logActivity, deleteUserByEmail);
router.put("/:email", logActivity, updateUserByEmail);

export default router;
