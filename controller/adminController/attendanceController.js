import AttendanceModel from "../../models/adminModels/attendanceSchema.js";
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import cron from 'node-cron';
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

// Format a Date object as "HH:mm"
export const formatDateToTimeString = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Function to create or update attendance record
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, attendanceType, inTime, outTime, totalHours, remarks, location } = req.body;

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ status: "error", message: "Invalid employee ID format" });
    }

    const employeeProfile = await UserProfileModel.findById(employeeId);
    if (!employeeProfile) {
      return res.status(404).json({ status: "error", message: "Employee not found" });
    }

    if (employeeProfile.role && employeeProfile.role.toLowerCase() === "partner") {
      return res.status(403).json({ status: "error", message: "Attendance cannot be created for partners" });
    }

    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');

    const existingAttendance = await AttendanceModel.findOne({
      employeeId,
      createdOn: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
    });

    let inTimeDate, outTimeDate;
    if (inTime) {
      inTimeDate = convertTimeStringToDate(inTime);
    }
    if (outTime) {
      outTimeDate = convertTimeStringToDate(outTime);
    }

    if (existingAttendance) {
      existingAttendance.attendanceType = attendanceType;
      existingAttendance.inTime = inTimeDate || existingAttendance.inTime;
      existingAttendance.outTime = outTimeDate || existingAttendance.outTime;
      existingAttendance.totalHours = totalHours || existingAttendance.totalHours;
      existingAttendance.location = location || existingAttendance.location; // Add location field

      if (inTime || outTime) {
        existingAttendance.remarks = undefined;
      }

      await existingAttendance.save();

      return res.status(200).json({
        status: "success",
        message: "Attendance record updated successfully",
        data: {
          ...existingAttendance._doc,
          inTime: existingAttendance.inTime ? formatDateToTimeString(existingAttendance.inTime) : undefined,
          outTime: existingAttendance.outTime ? formatDateToTimeString(existingAttendance.outTime) : undefined,
        },
      });
    }

    const currentDate = moment().toDate();

    const newAttendance = new AttendanceModel({
      employeeId,
      employeeName: employeeProfile.fullName,
      attendanceType,
      inTime: inTimeDate,
      outTime: outTimeDate,
      totalHours,
      remarks,
      location,
      createdOn: currentDate,
    });

    await newAttendance.save();

    return res.status(201).json({
      status: "success",
      message: "Attendance record created successfully",
      data: {
        ...newAttendance._doc,
        inTime: inTimeDate ? formatDateToTimeString(inTimeDate) : undefined,
        outTime: outTimeDate ? formatDateToTimeString(outTimeDate) : undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
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
      const { employeeId, inTime, outTime, totalHours, location, ...attendanceData } = attendance;

      return {
        ...attendanceData,
        employeeId: employeeId ? employeeId._id : undefined,
        employeeName: employeeId ? employeeId.fullName : "Unknown",
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: totalHours || "0 hours 0 mins",
        location: location || "N/A",
      };
    });

    res.status(200).json({
      message: "Attendance record retrieved successfully",
      data: flattenedAttendances,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving attendance records",
      error: error.message,
    });
  }
};

// Function to check attendance for all employees every 30 minutes and mark leave if missing
export const checkAndMarkAttendanceEvery30Minutes = async () => {
  try {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const employees = await UserProfileModel.find({
      role: { $not: { $regex: '^partner$', $options: 'i' } }
    }).lean();

    for (const employee of employees) {
      const employeeId = employee._id;

      const existingAttendance = await AttendanceModel.findOne({
        employeeId,
        createdOn: { $gte: todayStart, $lte: todayEnd },
      });

      if (!existingAttendance) {
        const leaveAttendance = new AttendanceModel({
          employeeId,
          employeeName: employee.fullName,
          attendanceType: "leave",
          createdOn: new Date(),
          remarks: "Did not mark attendance",
        });

        await leaveAttendance.save();
      }
    }
  } catch (error) {
    console.error("Error checking and marking attendance:", error.message);
  }
};

// Schedule the cron job
cron.schedule('*/1 * * * *', async () => {
  console.log("Running scheduled job to check and mark missing attendance...");
  await checkAndMarkAttendanceEvery30Minutes();
});

// Get employee data with date and employeeId.
export const getAttendanceByEmployeeIdAndDate = async (req, res) => {
  try {
    const { today, employeeId } = req.query;

    if (!today) {
      return res.status(400).json({
        status: "error",
        message: "Today's date is required in query parameters",
      });
    }

    const todayDate = new Date(today);
    const startOfDay = new Date(todayDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(todayDate.setHours(23, 59, 59, 999));

    const attendances = await AttendanceModel.find({
      employeeId,
      createdOn: { $gte: startOfDay, $lte: endOfDay },
    })
    .populate("employeeId", "fullName")
    .lean();

    if (!attendances || attendances.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No attendance records found for this employee on the given date",
      });
    }

    const formattedAttendances = attendances.map((attendance) => {
      const { inTime, outTime } = attendance;
      return {
        ...attendance,
        employeeId: attendance.employeeId._id,
        employeeName: attendance.employeeId.fullName,
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: attendance.totalHours || "0 hours 0 mins",
      };
    });

    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: formattedAttendances,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
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
      return res.status(404).json({ status: "error", message: "No attendance records found for this employee" });
    }

    const formattedAttendances = attendances.map((attendance) => {
      const { inTime, outTime } = attendance;
      return {
        ...attendance,
        employeeId: attendance.employeeId._id,
        employeeName: attendance.employeeId.fullName,
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: attendance.totalHours || "0 hours 0 mins",
      };
    });

    res.status(200).json({ message:"Attendance record retrived successfully by EmployeeId", data: formattedAttendances, status: "success" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving attendance records",
      error: error.message,
    });
  }
};

// API to fetch distinct roles from UserProfileModel
export const getAllDistinctRoles = async (req, res) => {
  try {
    const roles = await UserProfileModel.distinct("role");

    res.status(200).json({
      message: "Distinct roles fetched successfully",
      roles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching distinct roles",
      error: error.message,
    });
  }
};

// API Endpoint: Get attendance statistics for employee
export const getRolesAndAttendanceStatsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params; 
    
    const employee = await UserProfileModel.findById(employeeId).lean();
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        status: "error",
      });
    }
    
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const attendanceRecords = await AttendanceModel.find({
      employeeId,
      createdOn: { $gte: startOfMonth, $lte: endOfMonth },
    })
    .sort({ createdOn: -1 })
    .lean();

    let presentCount = 0;
    let leaveCount = 0;
    let halfDayCount = 0;
    let todaysAttendance = "Default";

    attendanceRecords.forEach((record) => {
      if (record.attendanceType === "present") {
        presentCount++;
      } else if (record.attendanceType === "leave") {
        leaveCount++;
      } else if (record.attendanceType === "halfday") {
        halfDayCount++;
      }

      const recordDate = moment(record.createdOn).startOf("day").toDate();
      const today = moment().startOf("day").toDate();
      if (recordDate.getTime() === today.getTime()) {
        todaysAttendance = record.attendanceType;
      }
    });

    const attendanceStats = {
      employeeId: employeeId.toString(),
      employeeName: employee.fullName,
      role: employee.role,
      present: presentCount,
      leave: leaveCount,
      halfDay: halfDayCount,
      todaysAttendance,
    };

    res.status(200).json({
      message: "Attendance statistics fetched successfully",
      data: attendanceStats,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance statistics",
      error: error.message,
    });
  }
};

// API Endpoint: Get roles and attendance statistics excluding "partner" roles
export const getRolesAndAttendanceStats = async (req, res) => {
  try {
    const roles = await UserProfileModel.distinct("role", {
      role: { $nin: ["partner", "Partner"] },
    });

    const roleAttendanceStats = {};
    const today = moment().startOf("day").toDate();

    for (const role of roles) {
      const employees = await UserProfileModel.find({ role }).lean();

      if (employees.length === 0) continue;

      roleAttendanceStats[role] = {
        employees: [],
      };

      for (const employee of employees) {
        const employeeId = employee._id;

        const todaysAttendanceRecord = await AttendanceModel.findOne({
          employeeId,
          createdOn: { $gte: today, $lte: moment().endOf("day").toDate() },
        });

        if (!todaysAttendanceRecord) {
          const leaveAttendance = new AttendanceModel({
            employeeId,
            employeeName: employee.fullName,
            attendanceType: "leave",
            createdOn: today,
            remarks: "Marked as leave due to no entry",
          });

          await leaveAttendance.save();
        }

        const startOfMonth = moment().startOf("month").toDate();
        const endOfMonth = moment().endOf("month").toDate();

        const attendanceRecords = await AttendanceModel.find({
          employeeId,
          createdOn: { $gte: startOfMonth, $lte: endOfMonth },
        }).lean();

        let presentCount = 0;
        let leaveCount = 0;
        let halfDayCount = 0;
        let todaysAttendance = todaysAttendanceRecord ? todaysAttendanceRecord.attendanceType : "leave";

        attendanceRecords.forEach((record) => {
          if (record.attendanceType === "present") {
            presentCount++;
          } else if (record.attendanceType === "leave") {
            leaveCount++;
          } else if (record.attendanceType === "half day") {
            halfDayCount++;
          }
        });

        roleAttendanceStats[role].employees.push({
          employeeId: employeeId.toString(),
          employeeName: employee.fullName,
          present: presentCount,
          leave: leaveCount,
          halfDay: halfDayCount,
          todaysAttendance,
        });
      }
    }

    res.status(200).json({
      message: "Roles and attendance statistics fetched successfully",
      data: roleAttendanceStats,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching roles and attendance statistics",
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
      return {
        ...attendance,
        employeeId: attendance.employeeId._id,
        employeeName: attendance.employeeId.fullName,
        inTime: inTime ? formatDateToTimeString(inTime) : undefined,
        outTime: outTime ? formatDateToTimeString(outTime) : undefined,
        totalHours: attendance.totalHours || "0 hours 0 mins",
      };
    });

    res.status(200).json({ message:"Attendance record retrived successfully by employeeId and date filter.",data: formattedAttendances, status: "success" });
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

    const formattedAttendance = {
      ...attendance,
      employeeId: attendance.employeeId._id,
      employeeName: attendance.employeeId.fullName,
      inTime: inTime ? formatDateToTimeString(inTime) : undefined,
      outTime: outTime ? formatDateToTimeString(outTime) : undefined,
      totalHours: attendance.totalHours || "0 hours 0 mins", // Show totalHours directly from DB
    };

    res.status(200).json({ message:"Attendance record retrived successfully",data: formattedAttendance , status: "success"});
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
    const { attendanceType, inTime, outTime, totalHours, remarks, updatedBy } = req.body;

    let attendance = await AttendanceModel.findById(id);

    if (!attendance) {
      attendance = new AttendanceModel({
        _id: id,
        attendanceType,
        inTime: convertTimeStringToDate(inTime),
        outTime: convertTimeStringToDate(outTime),
        totalHours,
        remarks,
        createdOn: new Date(),
        updatedBy,
      });
    } else {
      if (attendanceType) attendance.attendanceType = attendanceType;

      if (inTime) {
        attendance.inTime = convertTimeStringToDate(inTime);
      }

      if (outTime) {
        attendance.outTime = convertTimeStringToDate(outTime);
      }

      if (totalHours) attendance.totalHours = totalHours;

      if (remarks !== undefined) attendance.remarks = remarks;

      attendance.updatedOn = new Date();
      if (updatedBy) attendance.updatedBy = updatedBy;
    }

    await attendance.save();

    const response = {
      ...attendance.toObject(),
      inTime: attendance.inTime ? formatDateToTimeString(attendance.inTime) : undefined,
      outTime: attendance.outTime ? formatDateToTimeString(attendance.outTime) : undefined,
    };

    res.status(200).json({
      message: attendance.isNew ? "Attendance record created successfully" : "Attendance record updated successfully",
      data: response,
      status:"success"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating or creating attendance record",
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
    res.status(200).json({ message: "Attendance record deleted successfully", status:"success" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error deleting attendance record",
        error: error.message,
      });
  }
};
