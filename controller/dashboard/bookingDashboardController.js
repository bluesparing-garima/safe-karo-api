import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";

// Controller function to fetch booking dashboard counts
export const getBookingDashboardCount = async (req, res) => {
  const { policyCompletedBy } = req.params;

  if (!policyCompletedBy) {
    return res.status(400).json({
      message: "Policy Completed By is required",
      status: "error",
    });
  }

  try {
    // Aggregate net premium for the specified policyCompletedBy
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: { policyCompletedBy } },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    const netPremium = netPremiumAggregate.length > 0 ? netPremiumAggregate[0].totalNetPremium : 0;

    // Aggregate final premium for the specified policyCompletedBy
    const finalPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: { policyCompletedBy } },
      { $group: { _id: null, totalFinalPremium: { $sum: "$finalPremium" } } },
    ]);
    const finalPremium = finalPremiumAggregate.length > 0 ? finalPremiumAggregate[0].totalFinalPremium : 0;

    // Aggregate booking requests by status for the specified policyCompletedBy
    const bookingRequestsAggregate = await BookingRequest.aggregate([
      { $match: { bookingAcceptedBy: policyCompletedBy } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const totalBookingRequests = bookingRequestsAggregate.reduce((acc, curr) => acc + curr.count, 0);

    const formattedBookingRequests = bookingRequestsAggregate.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Aggregate motor policy counts for the specified policyCompletedBy
    const motorPolicyAggregate = await MotorPolicyModel.aggregate([
      { $match: { policyCompletedBy } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = motorPolicyAggregate.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

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
            "Requested Booking": formattedBookingRequests["requested"] || 0,
            "Booked Booking": formattedBookingRequests["booked"] || 0,
          },
          policyCounts: formattedPolicyCounts,
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
