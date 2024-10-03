import AttendanceModel from "../../models/adminModels/attendanceSchema.js"; 
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import mongoose from 'mongoose';

// Calculate total hours between InTime and OutTime
const calculateTotalHours = (inTime, outTime) => {
  const inTimeDate = new Date(inTime);
  const outTimeDate = new Date(outTime);
  const totalMilliseconds = outTimeDate - inTimeDate;
  const totalHours = totalMilliseconds / (1000 * 60 * 60);
  return totalHours;
};

export const createAttendance = async (req, res) => {
    try {
      const { employeeId, attendanceType, inTime, outTime, remarks } = req.body;
  
      console.log("Received employeeId:", employeeId);
      console.log("Received employeeId:", attendanceType);
      console.log("Received employeeId:", inTime);
  
      // Validate employeeId format
      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID format" });
      }
  
      // Get employee details from UserProfile
      const employeeProfile = await UserProfileModel.findById(employeeId);
      if (!employeeProfile) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
      // Convert inTime to a Date object, assuming today's date
      const currentDate = new Date();
      const [hours, minutes] = inTime.split(':').map(Number);
      const inTimeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes);
  
      let totalHours = 0;
  
      // Calculate total hours only if outTime is provided
      if (outTime) {
        totalHours = calculateTotalHours(inTimeDate, outTime);
      }
  
      const newAttendance = new AttendanceModel({
        employeeId,
        employeeName: employeeProfile.fullName,
        attendanceType,
        inTime: inTimeDate,
        outTime,
        totalHours,
        remarks,
      });
  
      await newAttendance.save();
  
      res.status(201).json({
        message: "Attendance record created successfully",
        data: newAttendance,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating attendance record",
        error: error.message,
      });
    }
  };
  
// Get All Attendances
export const getAllAttendances = async (req, res) => {
  try {
    const attendances = await AttendanceModel.find().populate(
      "employeeId",
      "fullName"
    );
    res.status(200).json({ data: attendances });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving attendance records",
        error: error.message,
      });
  }
};

// Get All Attendances by Employee ID
export const getAttendanceByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const attendances = await AttendanceModel.find({ employeeId }).populate(
      "employeeId",
      "fullName"
    );

    if (!attendances || attendances.length === 0) {
      return res
        .status(404)
        .json({ message: "No attendance records found for this employee" });
    }

    res.status(200).json({ data: attendances });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving attendance records",
        error: error.message,
      });
  }
};

// Get All Attendances by Employee ID and Date Range
export const getAttendancesByEmployeeIdAndDateRange = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    const employee = await UserProfileModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Find attendance records for the specified employeeId and date range
    const attendances = await AttendanceModel.find({
      employeeId,
      inTime: dateFilter,
    }).populate("employeeId", "fullName");

    res.status(200).json({ data: attendances });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving attendance records",
        error: error.message,
      });
  }
};

// Get Attendance by ID
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await AttendanceModel.findById(id).populate(
      "employeeId",
      "fullName"
    );
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.status(200).json({ data: attendance });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving attendance record",
        error: error.message,
      });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendanceType, inTime, outTime, remarks } = req.body;

    const attendance = await AttendanceModel.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (attendanceType) attendance.attendanceType = attendanceType;
    if (inTime && outTime) {
      attendance.inTime = inTime;
      attendance.outTime = outTime;
      attendance.totalHours = calculateTotalHours(inTime, outTime);
    }
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.status(200).json({
      message: "Attendance record updated successfully",
      data: attendance,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error updating attendance record",
        error: error.message,
      });
  }
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await AttendanceModel.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error deleting attendance record",
        error: error.message,
      });
  }
};
