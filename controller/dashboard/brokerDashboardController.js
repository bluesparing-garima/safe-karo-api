import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";
import creditAndDebitSchema from "../../models/accountsModels/creditAndDebitSchema.js";

export const getBrokerDashboardCount = async (req, res) => {
  const { brokerId, companyName } = req.query;

  if (!brokerId) {
    return res.status(400).json({
      message: "Broker Id is required",
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
    brokerId,
    issueDate: dateFilter,
  };

  try {
    if (companyName) {
      matchFilter.companyName = companyName;
    }

    // Policy Counts
    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { ...matchFilter, isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const formattedPolicyCounts = policyCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Net Premium
    const netPremiumAggregate = await MotorPolicyModel.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalNetPremium: { $sum: "$netPremium" } } },
    ]);
    const netPremium =
      netPremiumAggregate.length > 0
        ? netPremiumAggregate[0].totalNetPremium
        : 0;

     // Broker Payment In (PayIn) Calculation for the selected month
     const monthlyPayInAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { brokerId, policyDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalPayInAmount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Paid", "Partial"]] },
                "$payInAmount",
                0,
              ],
            },
          },
        },
      },
    ]);
    const payInAmount = monthlyPayInAggregate.length > 0 ? monthlyPayInAggregate[0].totalPayInAmount : 0;

    const totalPayInAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { brokerId } },
      {
        $group: {
          _id: null,
          totalPayInAmount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Paid", "Partial"]] },
                "$payInAmount",
                0, 
              ],
            },
          },
        },
      },
    ]);
    const totalPayInAmount = totalPayInAggregate.length > 0 ? totalPayInAggregate[0].totalPayInAmount : 0;

    // Existing Monthly and Total PayIn Commission
    const monthlyPayInCommissionAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { brokerId, policyDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalPayInCommission: { $sum: "$payInCommission" },
        },
      },
    ]);
    const monthlyPayInCommission = monthlyPayInCommissionAggregate.length > 0 ? monthlyPayInCommissionAggregate[0].totalPayInCommission : 0;

    const totalPayInCommissionAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { brokerId } },
      {
        $group: {
          _id: null,
          totalPayInCommission: { $sum: "$payInCommission" },
        },
      },
    ]);
    const totalPayInCommission = totalPayInCommissionAggregate.length > 0 ? totalPayInCommissionAggregate[0].totalPayInCommission : 0;

    const monthlyUnPaidAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { brokerId, policyDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalUnPaidAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "UnPaid"] },
                "$payInCommission",
                { $cond: [ { $eq: ["$status", "Partial"] }, "$payInBalance", 0 ] } 
              ],
            },
          },
        },
      },
    ]);
    const monthlyUnPaidAmount = monthlyUnPaidAmountAggregate.length > 0 ? monthlyUnPaidAmountAggregate[0].totalUnPaidAmount : 0;

    const totalUnPaidAmountAggregate = await MotorPolicyPaymentModel.aggregate([
      { $match: { brokerId } },
      {
        $group: {
          _id: null,
          totalUnPaidAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "UnPaid"] }, 
                "$payInCommission",
                { $cond: [ { $eq: ["$status", "Partial"] }, "$payInBalance", 0 ] } 
              ],
            },
          },
        },
      },
    ]);
    const totalUnPaidAmount = totalUnPaidAmountAggregate.length > 0 ? totalUnPaidAmountAggregate[0].totalUnPaidAmount : 0;

    // Booking Requests
    const bookingCounts = await BookingRequest.aggregate([
      { $match: { brokerId, createdOn: dateFilter } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const formattedBookingCounts = {};
    let totalBookingRequest = 0;
    bookingCounts.forEach((booking) => {
      formattedBookingCounts[booking._id] = booking.count;
      totalBookingRequest += booking.count;
    });

    const bookingStatuses = ["accepted", "requested", "booked", "rejected"];
    const bookingRequestsWithDefaults = bookingStatuses.reduce(
      (acc, status) => {
        acc[`${status.charAt(0).toUpperCase()}${status.slice(1)} Booking`] =
          formattedBookingCounts[status] || 0;
        totalBookingRequest +=
          acc[`${status.charAt(0).toUpperCase()}${status.slice(1)} Booking`];
        return acc;
      },
      { "Total Booking": totalBookingRequest }
    );

    // Balance
    const lastBalanceEntry = await creditAndDebitSchema.findOne(
      { brokerId },
      { brokerBalance: 1 },
      { sort: { createdOn: -1 } }
    );
    const balance = lastBalanceEntry ? lastBalanceEntry.brokerBalance : 0;

    const data = {
      message: "Broker dashboard counts retrieved successfully",
      data: [
        {
          premiums: {
            "Net Premium": Math.round(netPremium),
          },
          payments: {
            "Monthly PayIn Commission": Math.round(monthlyPayInCommission),
            "Total PayIn Commission": Math.round(totalPayInCommission),
            "Monthly PayIn Amount": Math.round(payInAmount),
            "Total PayIn Amount": Math.round(totalPayInAmount),
            "Monthly UnPaid Amount": Math.round(monthlyUnPaidAmount),
            "Total UnPaid Amount": Math.round(totalUnPaidAmount),
            Balance: Math.round(balance),
          },
          policyCounts: formattedPolicyCounts,
          bookingRequests: bookingRequestsWithDefaults,
        },
      ],
      status: "success",
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving broker dashboard counts",
      error: error.message,
    });
  }
};
// export default getBrokerDashboardCount;
