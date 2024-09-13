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
    // Get role counts
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

    // Initialize dynamic category data structure
    const categoryData = {};

    // Get policy counts grouped by category
    const policyCounts = await MotorPolicyModel.aggregate([
      { $match: { issueDate: dateFilter } },
      {
        $group: {
          _id: { $toLower: "$category" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get premiums grouped by category
    const netPremiums = await MotorPolicyModel.aggregate([
      { $match: { issueDate: dateFilter } },
      {
        $group: {
          _id: { $toLower: "$category" },
          NetPremium: { $sum: "$netPremium" },
          FinalPremium: { $sum: "$finalPremium" },
        },
      },
    ]);

    // Get commissions and additional data grouped by category
    const commissionSums = await MotorPolicyPaymentModel.aggregate([
      { $match: { policyDate: dateFilter } },
      {
        $group: {
          _id: { $toLower: "$category" },
          totalPayIn: { $sum: "$payInCommission" },
          totalPayInAmount: { $sum: "$payInAmount" },
          totalPayInBalance: { $sum: "$payInBalance" },
          totalPayOut: { $sum: "$payOutCommission" },
          totalPayOutAmount: { $sum: "$payOutAmount" },
          totalPartnerBalance: { $sum: "$partnerBalance" },
        },
      },
    ]);

    // Combine category data
    commissionSums.forEach((commission) => {
      const category = commission._id || ""; // Default to empty string if no category
      if (!categoryData[category]) {
        categoryData[category] = {
          policyCounts: 0,
          NetPremium: 0,
          FinalPremium: 0,
          PayInAmount: 0,
          BrokerAmount: 0,
          BrokerBalance: 0,
          PayOutAmount: 0,
          UnpaidAmount: 0,
          LeftDistributedAmount: 0,
          Revenue: 0,
        };
      }
      categoryData[category].PayInAmount = Math.round(commission.totalPayIn);
      categoryData[category].BrokerAmount = Math.round(commission.totalPayInAmount);
      categoryData[category].BrokerBalance = Math.round(commission.totalPayIn - commission.totalPayInAmount);
      categoryData[category].PayOutAmount = Math.round(commission.totalPayOut);
      categoryData[category].UnpaidAmount = Math.round(commission.totalPayOut - commission.totalPayOutAmount);
      categoryData[category].LeftDistributedAmount = Math.round(commission.totalPartnerBalance);
      categoryData[category].Revenue = Math.round(commission.totalPayIn - commission.totalPayOut);
    });

    // Populate category data with policy counts and premiums
    policyCounts.forEach((policy) => {
      if (categoryData[policy._id]) {
        categoryData[policy._id].policyCounts = policy.count;
      }
    });

    netPremiums.forEach((premium) => {
      if (categoryData[premium._id]) {
        categoryData[premium._id].NetPremium = Math.round(premium.NetPremium);
        categoryData[premium._id].FinalPremium = Math.round(premium.FinalPremium);
      }
    });

    // Format categories data in the desired structure (as array of objects)
    const formattedCategories = Object.entries(categoryData).map(([key, value]) => ({
      [key]: value,
    }));

    // Booking requests and leads
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

    // Admin related counts
    const brokerCount = await Broker.countDocuments();
    const makeCount = await Make.countDocuments();
    const modelCount = await Model.countDocuments();
    const categoryCount = await Category.countDocuments();
    const companyCount = await Company.countDocuments();
    const productTypeCount = await ProductType.countDocuments();
    const subProductTypeCount = await SubProductType.countDocuments();

    // Total accounts and amounts
    const totalAccounts = await Account.countDocuments();
    const totalAmountData = await Account.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalAmount = totalAmountData.length > 0 ? Math.round(totalAmountData[0].totalAmount) : 0;

    const accounts = await Account.find({}, "accountCode amount");

    // Construct the data array
    const data = [
      {
        roleCounts: formattedRoleCounts,
        categories: formattedCategories, // Updated category format
        bookingRequests: {
          "Total Booking": totalBookingRequest,
          ...formattedBookingCounts,
        },
        leadCounts: {
          "Total Lead": totalLead,
          ...formattedLeadCounts,
        },
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
    ];

    res.status(200).json({
      message: "Dashboard Count retrieved successfully",
      data, // Now an array
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
