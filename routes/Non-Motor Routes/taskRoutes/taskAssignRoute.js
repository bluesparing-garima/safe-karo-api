import express from "express";
import {
  createTask,
  getTasks,
  getTasksByEmployee,
  getTasksByArea,
  getTasksByInvestigation,
  getTasksByStatus,
  getTaskById,
  updateTask,
  deleteTask,
} from "../../../controller/Non-Motor/taskController/taskAssignController.js";

const router = express.Router();

// Task routes
router.post("/", createTask);
router.get("/", getTasks);
router.get("/investigation-id/:investigationId", getTasksByInvestigation);
router.get("/employee-id/:employeeId", getTasksByEmployee);
router.get("/area-id/:areaId", getTasksByArea);
router.get("/status/:status", getTasksByStatus);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
