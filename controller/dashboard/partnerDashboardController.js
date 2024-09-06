import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import Lead from "../../models/partnerModels/leadGenerateSchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";
import creditAndDebitSchema from "../../models/accountsModels/creditAndDebitSchema.js";

// Controller function to count policies by partnerId and category
export const getPartnerDashboardCount = async (req, res) => {
  const { partnerId } = req.query;

  if (!partnerId) {
    return res.status(400).json({
      message: "Partner Id is required",
      status: "error",
    });
  }

  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const dateFilter = {
    $gte: startDate,
    $lte: endDate,
  };

  try {
    // Aggregate count of policies by category for the specified partnerId
    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { partnerId, issueDate: dateFilter, isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = policyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Aggregate net premium for the specified partnerId
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: { partnerId, issueDate: dateFilter } },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    const netPremium =
      netPremiumAggregate.length > 0
        ? netPremiumAggregate[0].totalNetPremium
        : 0;

    // Aggregate lead counts for the specified partnerId
    const leadCounts = await Lead.aggregate([
      { $match: { partnerId, createdOn: dateFilter } },
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
    Object.keys(formattedLeadCounts).forEach((key) => {
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] =
        formattedLeadCounts[key];
    });

    // Aggregate reward (totalPayOutCommission) for the specified partnerId with date filter
    const rewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId, policyDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
    ]);
    const reward =
      rewardAggregate.length > 0 ? rewardAggregate[0].totalPayOutCommission : 0;

    // Aggregate reward (totalPayOutCommission) for the specified partnerId without date filter
    const totalRewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId } },
      {
        $group: {
          _id: null,
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
    ]);
    const totalReward =
      totalRewardAggregate.length > 0
        ? totalRewardAggregate[0].totalPayOutCommission
        : 0;

    // Aggregate booking requests by status for the specified partnerId
    const bookingCounts = await BookingRequest.aggregate([
      { $match: { partnerId, createdOn: dateFilter } },
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
    Object.keys(formattedBookingCounts).forEach((key) => {
      bookingRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Booking`] =
        formattedBookingCounts[key];
    });

    // Get the last entry of partnerBalance for the specified partnerId
    const lastBalanceEntry = await creditAndDebitSchema.findOne(
      { partnerId },
      { partnerBalance: 1 },
      { sort: { createdOn: -1 } }
    );
    const balance = lastBalanceEntry ? lastBalanceEntry.partnerBalance : 0;

    // Aggregate total payOutAmount for the specified partnerId
    const payOutAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId, policyDate: dateFilter } },
      { $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } } },
    ]);
    const payOutAmount =
      payOutAmountAggregate.length > 0
        ? payOutAmountAggregate[0].totalPayOutAmount
        : 0;

    const data = {
      message: "Partner dashboard counts retrieved successfully",
      data: [
        {
          premiums: {
            "Net Premium": netPremium,
          },
          commissions: {
            "Monthly Commission": reward,
            "Total Commission": totalReward,
            Balance: balance,
            "Paid Amount": payOutAmount,
          },
          policyCounts: formattedPolicyCounts,
          bookingRequests: bookingRequests,
          leadCounts: leadRequests,
        },
      ],
      status: "success",
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving partner dashboard counts",
      error: error.message,
    });
  }
};
