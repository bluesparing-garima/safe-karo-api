import UserProfileModel from "../../models/adminModels/userProfileSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import BookingRequest from "../../models/bookingModel/bookingRequestSchema.js";
import Lead from "../../models/partnerModels/leadGenerateSchema.js";
import Broker from "../../models/adminModels/brokerSchema.js";
import Make from "../../models/adminModels/makeSchema.js";
import Model from "../../models/adminModels/modelSchema.js";
import Category from "../../models/adminModels/categorySchema.js";
import Company from "../../models/adminModels/companySchema.js";
import ProductType from "../../models/adminModels/productSchema.js";
import SubProductType from "../../models/adminModels/productSubTypeSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";

export const getDashboardCount = async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
  };

  try {
    const roleCounts = await UserProfileModel.aggregate([
      {
        $project: {
          normalizedRole: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$role", "RM"] },
                  then: "Relationship Manager",
                },
              ],
              default: "$role",
            },
          },
        },
      },
      { $group: { _id: "$normalizedRole", count: { $sum: 1 } } },
    ]);

    const distinctRoles = await UserProfileModel.distinct("role");
    const formattedRoleCounts = {
      Total: distinctRoles.length,
    };
    roleCounts.forEach((role) => {
      formattedRoleCounts[role._id] = role.count;
    });

    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { issueDate: dateFilter } },
      {
        $group: {
          _id: { $toLower: "$category" },
          count: { $sum: 1 },
        },
      },
    ]);

    const netPremiums = await MotorPolicyModel.aggregate([
      { $match: { issueDate: dateFilter } },
      {
        $group: {
          _id: null,
          NetPremium: { $sum: "$netPremium" },
          FinalPremium: { $sum: "$finalPremium" },
        },
      },
      {
        $project: { _id: 0, NetPremium: 1, FinalPremium: 1 },
      },
    ]);

    const formattedPolicyCounts = {};
    policyCounts.forEach((policy) => {
      formattedPolicyCounts[policy._id] = policy.count;
    });

    const netPremium = netPremiums.length > 0 ? Math.round(netPremiums[0].NetPremium) : 0;
    const finalPremium = netPremiums.length > 0 ? Math.round(netPremiums[0].FinalPremium) : 0;

    const commissionSums = await MotorPolicyPaymentModel.aggregate([
      { $match: { policyDate: dateFilter } },
      {
        $group: {
          _id: null,
          totalPayIn: { $sum: "$payInCommission" },
          receivedAmount: { $sum: "$payInAmount" },
          totalPayInBalance: { $sum: "$payInBalance" },
          totalPartnerPayout: { $sum: "$payOutCommission" },
        },
      },
      {
        $project: { _id: 0, totalPayIn: 1, receivedAmount: 1, totalPayInBalance: 1, totalPartnerPayout: 1 },
      },
    ]);

    const totalPayIn = commissionSums.length > 0 ? Math.round(commissionSums[0].totalPayIn) : 0;
    const receivedAmount = commissionSums.length > 0 ? Math.round(commissionSums[0].receivedAmount) : 0;
    const totalPayInBalance = Math.round(totalPayIn - receivedAmount);
    const totalPartnerPayout = commissionSums.length > 0 ? Math.round(commissionSums[0].totalPartnerPayout) : 0;

    const bookingCounts = await BookingRequest.aggregate([
      { $match: { createdOn: dateFilter } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const formattedBookingCounts = {};
    let totalBookingRequest = 0;
    bookingCounts.forEach((booking) => {
      formattedBookingCounts[booking._id] = booking.count;
      totalBookingRequest += booking.count;
    });

    const leadCounts = await Lead.aggregate([
      { $match: { createdOn: dateFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formattedLeadCounts = {};
    let totalLead = 0;
    leadCounts.forEach((lead) => {
      formattedLeadCounts[lead._id] = lead.count;
      totalLead += lead.count;
    });

    const brokerCount = await Broker.countDocuments();
    const makeCount = await Make.countDocuments();
    const modelCount = await Model.countDocuments();
    const categoryCount = await Category.countDocuments();
    const companyCount = await Company.countDocuments();
    const productTypeCount = await ProductType.countDocuments();
    const subProductTypeCount = await SubProductType.countDocuments();

    const bookingRequests = {
      "Total Booking": totalBookingRequest,
    };
    Object.keys(formattedBookingCounts).forEach((key) => {
      bookingRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Booking`] = formattedBookingCounts[key];
    });

    const leadRequests = {
      "Total Lead": totalLead,
    };
    Object.keys(formattedLeadCounts).forEach((key) => {
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] = formattedLeadCounts[key];
    });

    const totalAccounts = await Account.countDocuments();
    const totalAmountData = await Account.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalAmount = totalAmountData.length > 0 ? Math.round(totalAmountData[0].totalAmount) : 0;

    const accounts = await Account.find({}, "accountCode amount");

    const data = {
      message: "Dashboard Count retrieved successfully",
      data: [
        {
          roleCounts: formattedRoleCounts,
          policyCounts: formattedPolicyCounts,
          premiums: {
            "Net Premium": netPremium,
            "Final Premium": finalPremium,
          },
          commissions: {
            "PayIn Commission": totalPayIn,
            "Broker Amount": receivedAmount,
            "Broker Balance": totalPayInBalance,
            "PayOut Commission": totalPartnerPayout,
          },
          bookingRequests: bookingRequests,
          leadCounts: leadRequests,
          adminCounts: {
            Brokers: brokerCount,
            Makes: makeCount,
            Models: modelCount,
            Categories: categoryCount,
            Companies: companyCount,
            "Product Types": productTypeCount,
            "SubProduct Types": subProductTypeCount,
          },
          totalAccounts,
          totalAmount,
          accounts: accounts.map((acc) => ({
            accountCode: acc.accountCode,
            amount: acc.amount,
          })),
        },
      ],
      status: "success",
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
