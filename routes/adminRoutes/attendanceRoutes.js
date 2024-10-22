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
  getAllDistinctRoles,
  getRolesAndAttendanceStatsByEmployeeId,
  getAttendanceByEmployeeIdAndDate
} from "../../controller/adminController/attendanceController.js";

const router = express.Router();

// Create Attendance
router.post("/", createAttendance);

// Get All Attendances
router.get("/", getAllAttendances);

// Get All Attendances by Employee ID and Date Range
router.get("/employee/date-range", getAttendancesByEmployeeIdAndDateRange);

// Get Attendance by Employee ID and date filter
router.get("/employee/:employeeId", getAttendanceByEmployeeId);

// Get Attendance by Employee ID
router.get("/employee", getAttendanceByEmployeeIdAndDate);

// all distinct roles from UserProfileModel
router.get("/roles", getAllDistinctRoles);

// API Endpoint: Get roles and attendance statistics
router.get("/stats/employee/:employeeId", getRolesAndAttendanceStatsByEmployeeId);

// API Endpoint: Get roles and attendance statistics
router.get("/stats", getRolesAndAttendanceStats);

// Get Attendance by ID
router.get("/:id", getAttendanceById);

// Update Attendance
router.put("/:id", updateAttendance);

// Delete Attendance
router.delete("/:id", deleteAttendance);

export default router;
