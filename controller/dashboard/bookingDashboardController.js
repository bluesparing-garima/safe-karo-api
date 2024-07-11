import MotorPolicyModel from '../../models/policyModel/motorpolicySchema.js';
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";

// Controller function to fetch booking dashboard counts
export const getBookingDashboardCount = async (req, res) => {
  const { partnerId } = req.params;

  if (!partnerId) {
    return res.status(400).json({
      message: 'Partner Id is required',
      status: 'error',
    });
  }

  try {
    // Aggregate net premium for the specified partnerId
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, totalNetPremium: { $sum: '$netPremium' } } },
    ]);
    const netPremium = netPremiumAggregate.length > 0 ? netPremiumAggregate[0].totalNetPremium : 0;

    // Aggregate accepted booking requests for the specified partnerId
    const acceptedRequestsAggregate = await BookingRequest.aggregate([
      { $match: { partnerId, bookingStatus: 'accepted' } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);
    const acceptedRequests = acceptedRequestsAggregate.length > 0 ? acceptedRequestsAggregate[0].count : 0;

    // Placeholder for pay-in and pay-out commissions (commented out)
    // const payInCommission = 0; // Replace with actual calculation logic if needed
    // const payOutCommission = 0; // Replace with actual calculation logic if needed

    const data = {
      message: 'Booking dashboard counts retrieved successfully',
      data: [
        {
          premiums: {
            'Net Premium': netPremium,
          },
          acceptedRequests: acceptedRequests,
          // commissions: {
          //   'PayIn Commission': payInCommission,
          //   'PayOut Commission': payOutCommission,
          // },
        },
      ],
      status: 'success',
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving booking dashboard counts',
      error: error.message,
    });
  }
};
