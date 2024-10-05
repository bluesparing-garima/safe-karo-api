import AttendanceModel from "../../models/adminModels/attendanceSchema.js"; 
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import mongoose from 'mongoose';
import moment from 'moment';

// Convert a time string (e.g., "18:35") to a Date object with today's date
export const convertTimeStringToDate = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

// Calculate total hours worked between inTime and outTime
export const calculateTotalHours = (inTime, outTime) => {
  const totalMilliseconds = new Date(outTime) - new Date(inTime);
  const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60)); // Whole hours
  const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes
  return { totalHours, totalMinutes }; // Return both
};

// Format total hours as a string
export const formatTotalHours = ({ totalHours, totalMinutes }) => {
  return `${totalHours} hours ${totalMinutes} mins`;
};


// Format a Date object as "HH:mm"
export const formatDateToTimeString = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Function to create attendance record
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, attendanceType, inTime, outTime, remarks } = req.body;

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }

    const employeeProfile = await UserProfileModel.findById(employeeId);
    if (!employeeProfile) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const currentDate = new Date();
    const [inHours, inMinutes] = inTime.split(':').map(Number);
    const inTimeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), inHours, inMinutes);

    let totalHours = 0;
    let outTimeDate;

    if (outTime) {
      const [outHours, outMinutes] = outTime.split(':').map(Number);
      outTimeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), outHours, outMinutes);
      totalHours = calculateTotalHours(inTimeDate, outTimeDate);
    }

    const newAttendance = new AttendanceModel({
      employeeId,
      employeeName: employeeProfile.fullName,
      attendanceType,
      inTime: inTimeDate,
      outTime: outTimeDate,
      totalHours,
      remarks,
    });

    await newAttendance.save();

    res.status(201).json({
      message: "Attendance record created successfully",
      data: {
        ...newAttendance._doc,
        inTime: formatDateToTimeString(inTimeDate),
        outTime: outTimeDate ? formatDateToTimeString(outTimeDate) : undefined,
      },
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
    const attendances = await AttendanceModel.find()
      .populate("employeeId", "fullName")
      .lean();

    const flattenedAttendances = attendances.map((attendance) => {
      const { employeeId, inTime, outTime, totalHours, ...attendanceData } = attendance;

      return {
        ...attendanceData, 
        employeeId: employeeId._id,
        employeeName: employeeId.fullName,
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: attendance.totalHours || "0 hours 0 mins",
      };
    });

    res.status(200).json({ data: flattenedAttendances });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving attendance records",
      error: error.message,
    });
  }
};

// Get All Attendances by Employee ID
export const getAttendanceByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const attendances = await AttendanceModel.find({ employeeId })
      .populate("employeeId", "fullName")
      .lean();

    if (!attendances || attendances.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this employee" });
    }

    const formattedAttendances = attendances.map((attendance) => {
      const { inTime, outTime } = attendance;
      const { totalHours, totalMinutes } = calculateTotalHours(inTime, outTime);
      return {
        ...attendance,
        employeeId: attendance.employeeId._id,
        employeeName: attendance.employeeId.fullName,
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: formatTotalHours({ totalHours, totalMinutes }), // Format total hours
      };
    });

    res.status(200).json({ data: formattedAttendances });
  } catch (error) {
    res.status(500).json({
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

    const attendances = await AttendanceModel.find({
      employeeId,
      inTime: dateFilter,
    }).populate("employeeId", "fullName").lean();

    const formattedAttendances = attendances.map((attendance) => {
      const { inTime, outTime } = attendance;
      const { totalHours, totalMinutes } = calculateTotalHours(inTime, outTime);
      return {
        ...attendance,
        employeeId: attendance.employeeId._id,
        employeeName: attendance.employeeId.fullName,
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: formatTotalHours({ totalHours, totalMinutes }), // Format total hours
      };
    });

    res.status(200).json({ data: formattedAttendances });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving attendance records",
      error: error.message,
    });
  }
};

// Get Attendance by ID
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await AttendanceModel.findById(id)
      .populate("employeeId", "fullName")
      .lean();

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const { inTime, outTime } = attendance;
    const { totalHours, totalMinutes } = calculateTotalHours(inTime, outTime);

    const formattedAttendance = {
      ...attendance,
      employeeId: attendance.employeeId._id,
      employeeName: attendance.employeeId.fullName,
      inTime: inTime ? formatDateToTimeString(inTime) : undefined,
      outTime: outTime ? formatDateToTimeString(outTime) : undefined,
      totalHours: formatTotalHours({ totalHours, totalMinutes }), // Format total hours
    };

    res.status(200).json({ data: formattedAttendance });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving attendance record",
      error: error.message,
    });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => { 
  try {
    const { id } = req.params;
    const { attendanceType, inTime, outTime, remarks, updatedBy } = req.body;

    const attendance = await AttendanceModel.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (attendanceType) attendance.attendanceType = attendanceType;

    let inTimeDate, outTimeDate;
    if (inTime) {
      inTimeDate = convertTimeStringToDate(inTime);
      attendance.inTime = inTimeDate;
    }

    if (outTime) {
      outTimeDate = convertTimeStringToDate(outTime);
      attendance.outTime = outTimeDate;

      // Calculate total hours only if both inTime and outTime are present
      if (attendance.inTime) {
        const { totalHours, totalMinutes } = calculateTotalHours(attendance.inTime, outTimeDate);
        attendance.totalHours = formatTotalHours({ totalHours, totalMinutes });
      }
    }

    // Update remarks if provided
    if (remarks !== undefined) attendance.remarks = remarks;

    // Set updatedOn and updatedBy fields
    attendance.updatedOn = new Date();
    if (updatedBy) attendance.updatedBy = updatedBy;

    // Save the updated attendance record
    await attendance.save();

    // Format inTime and outTime as "HH:mm" for response
    const response = {
      ...attendance.toObject(),
      inTime: attendance.inTime ? formatDateToTimeString(attendance.inTime) : undefined,
      outTime: attendance.outTime ? formatDateToTimeString(attendance.outTime) : undefined,
    };

    res.status(200).json({
      message: "Attendance record updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
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
