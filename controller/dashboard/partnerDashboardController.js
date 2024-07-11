import MotorPolicyModel from '../../models/policyModel/motorpolicySchema.js';
import MotorPolicyPaymentModel from '../../models/policyModel/motorPolicyPaymentSchema.js';
import Lead from '../../models/partnerModels/leadGenerateSchema.js';
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";

// Controller function to count policies by partnerId and category
export const getPartnerDashboardCount = async (req, res) => {
  const { partnerId } = req.params;

  if (!partnerId) {
    return res.status(400).json({
      message: 'Partner Id is required',
      status: 'error',
    });
  }

  try {
    // Aggregate total count of policies for the specified partnerId
    const totalPolicies = await MotorPolicyModel.countDocuments({ partnerId });

    // Aggregate count of policies by category for the specified partnerId
    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const formattedCounts = policyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Aggregate net premium for the specified partnerId
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, totalNetPremium: { $sum: '$netPremium' } } },
    ]);
    const netPremium = netPremiumAggregate.length > 0 ? netPremiumAggregate[0].totalNetPremium : 0;

    // Aggregate lead counts for the specified partnerId
    const leadCounts = await Lead.aggregate([
      { $match: { partnerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formattedLeadCounts = {};
    let totalLead = 0;
    leadCounts.forEach((lead) => {
      formattedLeadCounts[lead._id] = lead.count;
      totalLead += lead.count;
    });
    // Prepare leadCounts dynamically
    const leadRequests = {
      "Total Lead": totalLead,
    };
    Object.keys(formattedLeadCounts).forEach(key => {
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] = formattedLeadCounts[key];
    });

    // Aggregate reward (totalPayOutCommission) for the specified partnerId
    const rewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, totalPayOutCommission: { $sum: '$payOutCommission' } } },
    ]);
    const reward = rewardAggregate.length > 0 ? rewardAggregate[0].totalPayOutCommission : 0;

    // Aggregate booking requests by status for the specified partnerId
    const bookingCounts = await BookingRequest.aggregate([
      { $match: { partnerId } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const formattedBookingCounts = {};
    let totalBookingRequest = 0;
    bookingCounts.forEach((booking) => {
      formattedBookingCounts[booking._id] = booking.count;
      totalBookingRequest += booking.count;
    });

    // Prepare bookingRequests dynamically
    const bookingRequests = {
      "Total Booking": totalBookingRequest,
    };
    Object.keys(formattedBookingCounts).forEach(key => {
      bookingRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Booking`] = formattedBookingCounts[key];
    });

    const data = {
      message: 'Partner dashboard counts retrieved successfully',
      data: [
        {
          premiums: {
            'Net Premium': netPremium,
          },
          commissions: {
            'PayOut Commission': reward,
          },
          bookingRequests: bookingRequests,
          leadCounts: leadRequests,
        },
      ],
      status: 'success',
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving partner dashboard counts',
      error: error.message,
    });
  }
};
