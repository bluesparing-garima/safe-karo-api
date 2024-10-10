import HolidayCalendar from "../../models/adminModels/holidayCalendarSchema.js";
import Attendance from "../../models/adminModels/attendanceSchema.js";
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";

export const getHRDashboardCount = async (req, res) => {
  try {
    const { startDate, endDate, hrId } = req.query;

    if (!startDate || !endDate || !hrId) {
      return res.status(400).json({
        message: "startDate, endDate, and hrId are required fields",
        status: "failure",
      });
    }

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const leaveDetails = await Attendance.aggregate([
      {
        $match: {
          attendanceType: { $in: ["leave", "half day"] },
          createdOn: { $gte: startOfToday, $lte: endOfToday },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: "$employeeDetails._id",
          employeeName: "$employeeDetails.fullName",
          leaveType: "$attendanceType",
          remarks: "$remarks",  
        },
      },
    ]);

    const leaveCount = leaveDetails.length;

    const presentDetails = await Attendance.aggregate([
      {
        $match: {
          attendanceType: "present",
          createdOn: { $gte: startOfToday, $lte: endOfToday },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: "$employeeDetails._id",
          employeeName: "$employeeDetails.fullName",
          department: "$employeeDetails.department",
        },
      },
    ]);

    const presentCount = presentDetails.length;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const monthlyHolidays = await HolidayCalendar.find({
      date: { $gte: start, $lt: end },
    }).select("date name");

    const monthlyHolidayCount = monthlyHolidays.length;

    const currentYear = new Date().getFullYear();
    const yearHolidays = await HolidayCalendar.find({
      date: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1),
      },
    }).select("date name");

    const yearHolidayCount = yearHolidays.length;

    const roleCounts = await UserProfileModel.aggregate([
      { $match: { isActive: true, role: { $nin: ["partner", "Partner"] } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    
    const formattedRoleCounts = {};
    roleCounts.forEach((role) => {
      formattedRoleCounts[role._id] = role.count;
    });
    

    res.status(200).json({
      message: "HR Dashboard data retrieved successfully",
      data: {
        leaveCountToday: leaveCount,
        leaveDetailsToday: leaveDetails,
        presentCountToday: presentCount,
        presentDetailsToday: presentDetails,
        monthlyHolidays: {
          count: monthlyHolidayCount,
          holidays: monthlyHolidays.map((holiday) => ({
            date: holiday.date,
            name: holiday.name,
          })),
        },
        yearTotalHolidays: {
          count: yearHolidayCount,
          holidays: yearHolidays.map((holiday) => ({
            date: holiday.date,
            name: holiday.name,
          })),
        },
        roles: formattedRoleCounts,
      },
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
