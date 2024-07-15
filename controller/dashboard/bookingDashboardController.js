import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";

// Controller function to fetch booking dashboard counts
export const getBookingDashboardCount = async (req, res) => {
  const { policyCompletedBy } = req.params;
  console.log("policyCompletedBy", policyCompletedBy);

  if (!policyCompletedBy) {
    return res.status(400).json({
      message: "Booking Id is required",
      status: "error",
    });
  }

  try {
    // Aggregate net premium for the specified policyCompletedBy
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: { policyCompletedBy } },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    console.log("netPremium", netPremiumAggregate);
    const netPremium =
      netPremiumAggregate.length > 0
        ? netPremiumAggregate[0].totalNetPremium
        : 0;

    // Aggregate accepted booking requests for the specified policyCompletedBy
    const acceptedRequestsAggregate = await BookingRequest.aggregate([
      { $match: { bookingAcceptedBy:policyCompletedBy } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);
    console.log(acceptedRequestsAggregate)
    const acceptedRequests =
      acceptedRequestsAggregate.length > 0
        ? acceptedRequestsAggregate[0].count
        : 0;

    // Aggregate motor policy counts for the specified policyCompletedBy
    const motorPolicyAggregate = await MotorPolicyModel.aggregate([
      { $match: { policyCompletedBy } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = motorPolicyAggregate.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {}
    );

    const data = {
      message: "Booking dashboard counts retrieved successfully",
      data: [
        {
          premiums: {
            "Net Premium": netPremium,
          },
          bookingRequests: {
            "Accepted Requests": acceptedRequests,
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
