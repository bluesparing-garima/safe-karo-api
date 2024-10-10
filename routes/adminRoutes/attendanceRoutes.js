import express from "express";
import {
  createAttendance,
  getAllAttendances,
  getAttendanceByEmployeeId,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendancesByEmployeeIdAndDateRange,
  getRolesAndAttendanceStats,
  getAllDistinctRoles
} from "../../controller/adminController/attendanceController.js";

const router = express.Router();

// Create Attendance
router.post("/", createAttendance);

// Get All Attendances
router.get("/", getAllAttendances);

// Get Attendance by Employee ID
router.get("/employee/:employeeId", getAttendanceByEmployeeId);

// all distinct roles from UserProfileModel
router.get("/roles", getAllDistinctRoles);

// API Endpoint: Get roles and attendance statistics
router.get("/stats", getRolesAndAttendanceStats);

// Get All Attendances by Employee ID and Date Range
router.get("/employee", getAttendancesByEmployeeIdAndDateRange);

// Get Attendance by ID
router.get("/:id", getAttendanceById);

// Update Attendance
router.put("/:id", updateAttendance);

// Delete Attendance
router.delete("/:id", deleteAttendance);

export default router;
