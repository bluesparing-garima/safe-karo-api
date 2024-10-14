import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";
import HolidayCalendar from "../../models/adminModels/holidayCalendarSchema.js";

export const getBookingDashboardCount = async (req, res) => {
  const { policyCompletedBy } = req.params;
  const { startDate, endDate } = req.query;

  if (!policyCompletedBy || !startDate || !endDate) {
    return res.status(400).json({
      message: "Policy Completed By, Start Date, and End Date are required",
      status: "error",
    });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      {
        $match: {
          policyCompletedBy,
          issueDate: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    const netPremium = netPremiumAggregate.length > 0 ? Math.round(netPremiumAggregate[0].totalNetPremium * 100) / 100 : 0;
    
    const finalPremiumAggregate = await MotorPolicyModel.aggregate([
      {
        $match: {
          policyCompletedBy,
          issueDate: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, totalFinalPremium: { $sum: "$finalPremium" } } },
    ]);
    const finalPremium = finalPremiumAggregate.length > 0 ? Math.round(finalPremiumAggregate[0].totalFinalPremium * 100) / 100 : 0;
    
    const requestedBookingCount = await BookingRequest.countDocuments({
      bookingStatus: "requested",
      createdOn: { $gte: start, $lte: end },
    });

    const bookingRequestsAggregate = await BookingRequest.aggregate([
      {
        $match: {
          bookingAcceptedBy: policyCompletedBy,
          createdOn: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const totalBookingRequests = bookingRequestsAggregate.reduce((acc, curr) => acc + curr.count, 0);

    const formattedBookingRequests = bookingRequestsAggregate.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const motorPolicyAggregate = await MotorPolicyModel.aggregate([
      {
        $match: {
          policyCompletedBy,
          issueDate: { $gte: start, $lte: end }, 
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = motorPolicyAggregate.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    const monthlyHolidays = await HolidayCalendar.find({
      date: { $gte: start, $lt: end },
    }).select("date name");

    const monthlyHolidayCount = monthlyHolidays.length;

    const data = {
      message: "Booking dashboard counts retrieved successfully",
      data: [
        {
          premiums: {
            "Net Premium": netPremium,
            "Final Premium": finalPremium,
          },
          bookingRequests: {
            "Total Booking": totalBookingRequests,
            "Accepted Booking": formattedBookingRequests["accepted"] || 0,
            "Requested Booking": requestedBookingCount,
            "Booked Booking": formattedBookingRequests["booked"] || 0,
          },
          policyCounts: formattedPolicyCounts,
          monthlyHolidays: {
            count: monthlyHolidayCount,
            holidays: monthlyHolidays.map((holiday) => ({
              date: holiday.date,
              name: holiday.name,
            })),
          },
        },
      ],
      status: "success",
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving booking dashboard counts",
      error: error.message,
    });
  }
};
