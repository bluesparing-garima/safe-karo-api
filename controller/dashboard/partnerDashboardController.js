import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import Lead from "../../models/partnerModels/leadGenerateSchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";
import creditAndDebitSchema from "../../models/accountsModels/creditAndDebitSchema.js";

export const getPartnerDashboardCount = async (req, res) => {
  const { partnerId, companyName } = req.query;

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

  let matchFilter = {
    partnerId,
    issueDate: dateFilter,
  };

  try {
    if (companyName) {
      matchFilter.companyName = companyName;
    }

    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { ...matchFilter, isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = policyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    const netPremium = netPremiumAggregate.length > 0 ? netPremiumAggregate[0].totalNetPremium : 0;

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

    const leadRequests = {
      "Total Lead": totalLead,
    };
    Object.keys(formattedLeadCounts).forEach((key) => {
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] = formattedLeadCounts[key];
    });

    const rewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId, policyDate: dateFilter } },
      { $group: { _id: null, totalPayOutCommission: { $sum: "$payOutCommission" } } },
    ]);
    const reward = rewardAggregate.length > 0 ? rewardAggregate[0].totalPayOutCommission : 0;

    const totalRewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, totalPayOutCommission: { $sum: "$payOutCommission" } } },
    ]);
    const totalReward = totalRewardAggregate.length > 0 ? totalRewardAggregate[0].totalPayOutCommission : 0;

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

    const bookingStatuses = ["accepted", "requested", "booked", "Rejected"];
    const bookingRequestsWithDefaults = bookingStatuses.reduce((acc, status) => {
      acc[`${status.charAt(0).toUpperCase()}${status.slice(1)} Booking`] = formattedBookingCounts[status] || 0;
      totalBookingRequest += acc[`${status.charAt(0).toUpperCase()}${status.slice(1)} Booking`];
      return acc;
    }, { "Total Booking": totalBookingRequest });

    const lastBalanceEntry = await creditAndDebitSchema.findOne(
      { partnerId },
      { partnerBalance: 1 },
      { sort: { createdOn: -1 } }
    );
    const balance = lastBalanceEntry ? lastBalanceEntry.partnerBalance : 0;

    const payOutAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId, policyDate: dateFilter } },
      { $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } } },
    ]);
    const payOutAmount = payOutAmountAggregate.length > 0 ? payOutAmountAggregate[0].totalPayOutAmount : 0;

    const totalPayOutAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } } },
    ]);
    const totalPayOutAmount = totalPayOutAmountAggregate.length > 0 ? totalPayOutAmountAggregate[0].totalPayOutAmount : 0;

    const data = {
      message: "Partner dashboard counts retrieved successfully",
      data: [
        {
          premiums: {
            "Net Premium": Math.round(netPremium),
          },
          commissions: {
            "Monthly Commission": Math.round(reward),
            "Total Commission": Math.round(totalReward),
            Balance: Math.round(balance),
            "Monthly Paid Amount": Math.round(payOutAmount),
            "Total Paid Amount": Math.round(totalPayOutAmount),
            "Monthly UnPaid Amount": Math.round(reward - payOutAmount),
            "Total UnPaid Amount": Math.round(totalReward - totalPayOutAmount),
          },
          policyCounts: formattedPolicyCounts,
          bookingRequests: bookingRequestsWithDefaults,
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
