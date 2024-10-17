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
    let policyNumbers = [];

    if (companyName) {
      const policies = await MotorPolicyModel.find(
        { companyName, partnerId, issueDate: dateFilter },
        "policyNumber"
      );
      policyNumbers = policies.map((policy) => policy.policyNumber);

      if (policyNumbers.length === 0) {
        return res.status(200).json({
          message: "No policies found for the provided company",
          data: [],
          status: "success",
        });
      }
    }

    const policyMatchFilter = companyName
      ? {
          policyNumber: { $in: policyNumbers },
          partnerId,
          policyDate: dateFilter,
        }
      : { partnerId, policyDate: dateFilter };

    // 1. Policy Counts
    const policyCounts = await MotorPolicyModel.aggregate([
      {
        $match: {
          ...matchFilter,
          ...(companyName && { policyNumber: { $in: policyNumbers } }),
          isActive: true,
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = policyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // 2. Net Premium
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      {
        $match: {
          ...matchFilter,
          ...(companyName && { policyNumber: { $in: policyNumbers } }),
        },
      },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    const netPremium =
      netPremiumAggregate.length > 0
        ? netPremiumAggregate[0].totalNetPremium
        : 0;

    // 3. Lead Counts
    const leadMatchFilter = companyName
      ? { partnerId, companyName, createdOn: dateFilter }
      : { partnerId, createdOn: dateFilter };

    const leadCounts = await Lead.aggregate([
      { $match: leadMatchFilter },
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
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] =
        formattedLeadCounts[key];
    });

    // 4. Rewards and Commissions
    const rewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { ...policyMatchFilter, isActive: true } },
      {
        $group: {
          _id: null,
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
    ]);
    const reward =
      rewardAggregate.length > 0 ? rewardAggregate[0].totalPayOutCommission : 0;

    const totalRewardAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId, isActive: true } },
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

    // 5. Booking Requests
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
    const bookingRequestsWithDefaults = bookingStatuses.reduce(
      (acc, status) => {
        acc[`${status.charAt(0).toUpperCase()}${status.slice(1)} Booking`] =
          formattedBookingCounts[status] || 0;
        return acc;
      },
      { "Total Booking": totalBookingRequest }
    );

    // 6. Balance
    const lastBalanceEntry = await creditAndDebitSchema.findOne(
      { partnerId },
      { partnerBalance: 1 },
      { sort: { createdOn: -1 } }
    );
    const balance = lastBalanceEntry ? lastBalanceEntry.partnerBalance : 0;

    // Calculate Monthly Paid Amount
    const monthlyPaidAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      {
        $match: {
          ...policyMatchFilter,
          isActive: true,
          payOutPaymentStatus: "Paid",
        },
      },
      { $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } } },
    ]);
    const monthlyPaidAmount =
      monthlyPaidAmountAggregate.length > 0
        ? monthlyPaidAmountAggregate[0].totalPayOutAmount
        : 0;

    // Calculate Total Paid Amount
    const totalPaidAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { partnerId, isActive: true, payOutPaymentStatus: "Paid" } },
      { $group: { _id: null, totalPayOutAmount: { $sum: "$payOutAmount" } } },
    ]);
    const totalPaidAmount =
      totalPaidAmountAggregate.length > 0
        ? totalPaidAmountAggregate[0].totalPayOutAmount
        : 0;

    // Calculate Monthly UnPaid Amount
    const monthlyUnpaidAggregate = await MotorPolicyPaymentModel.aggregate([
      {
        $match: {
          ...policyMatchFilter,
          isActive: true,
          payOutPaymentStatus: { $in: ["UnPaid", "Partial"] },
        },
      },
      {
        $addFields: {
          relevantAmount: {
            $cond: [
              { $eq: ["$payOutPaymentStatus", "UnPaid"] },
              "$payOutCommission",
              { $cond: [{ $eq: ["$payOutPaymentStatus", "Partial"] }, "$payOutBalance", 0] },
            ],
          },
        },
      },
      { $group: { _id: null, totalUnpaidAmount: { $sum: "$relevantAmount" } } },
    ]);
    const monthlyUnpaidAmount =
      monthlyUnpaidAggregate.length > 0 ? monthlyUnpaidAggregate[0].totalUnpaidAmount : 0;

    // Calculate Total UnPaid Amount
    const totalUnpaidAggregate = await MotorPolicyPaymentModel.aggregate([
      {
        $match: {
          partnerId,
          isActive: true,
          payOutPaymentStatus: { $in: ["UnPaid", "Partial"] },
        },
      },
      {
        $addFields: {
          relevantAmount: {
            $cond: [
              { $eq: ["$payOutPaymentStatus", "UnPaid"] },
              "$payOutCommission",
              { $cond: [{ $eq: ["$payOutPaymentStatus", "Partial"] }, "$payOutBalance", 0] },
            ],
          },
        },
      },
      { $group: { _id: null, totalUnpaidAmount: { $sum: "$relevantAmount" } } },
    ]);
    const totalUnpaidAmount =
      totalUnpaidAggregate.length > 0 ? totalUnpaidAggregate[0].totalUnpaidAmount : 0;

    // 8. Final Data Structure
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
            "Monthly Paid Amount": Math.round(monthlyPaidAmount),
            "Total Paid Amount": Math.round(totalPaidAmount),
            "Monthly UnPaid Amount": Math.round(monthlyUnpaidAmount),
            "Total UnPaid Amount": Math.round(totalUnpaidAmount),
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
