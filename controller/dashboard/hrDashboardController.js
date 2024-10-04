import HolidayCalendar from "../../models/adminModels/holidayCalendarSchema.js";
import Attendance from "../../models/adminModels/AttendanceSchema.js";
import UserProfileModel from "../../models/adminModels/userProfileSchema.js";

export const getHRDashboardData = async (req, res) => {
  try {
    const currentDate = new Date();
    const today = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999));

    // Get today's leave and half-day count
    const leaveCount = await Attendance.countDocuments({
      attendanceType: { $in: ["leave", "halfDay"] },
      createdOn: { $gte: today, $lte: endOfToday },
      isActive: true,
    });

    // Get month-wise holiday count
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthlyHolidays = await HolidayCalendar.countDocuments({
      date: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      },
    });

    // Get yearly holiday count
    const yearHolidays = await HolidayCalendar.countDocuments({
      date: { $gte: new Date(currentYear, 0, 1), $lt: new Date(currentYear + 1, 0, 1) },
    });

    // Get role counts from UserProfile
    const roleCounts = await UserProfileModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Format role counts into an object
    const formattedRoleCounts = {};
    roleCounts.forEach(role => {
      formattedRoleCounts[role._id] = role.count;
    });

    res.status(200).json({
      message: "HR Dashboard data retrieved successfully",
      data: {
        leaveCountToday: leaveCount,
        monthlyHolidays,
        yearTotalHolidays: yearHolidays,
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
