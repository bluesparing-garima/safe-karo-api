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
    // Fetch all categories
    const categories = await Category.find().lean();
    const categoryNames = categories.map(cat => cat.categoryName.toLowerCase());

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

    // Initialize category data with zero values
    const categoryData = {};
    categoryNames.forEach(category => {
      categoryData[category] = {
        "Policy Count": 0,
        "Net Premium": 0,
        "Final Premium": 0,
        "PayIn Amount": 0,
        "Broker Amount": 0,
        "Broker Balance": 0,
        "PayOut Amount": 0,
        "UnPaid Amount": 0,
        "Left Distributed Amount": 0,
        Revenue: 0,
        "Total UnPaid Amount": 0,
        "Total Left Distributed Amount": 0,
        "Total Revenue": 0,
      };
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
          _id: { $toLower: "$category" },
          "Net Premium": { $sum: "$netPremium" },
          "Final Premium": { $sum: "$finalPremium" },
        },
      },
    ]);

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

    const totalCommissionSums = await MotorPolicyPaymentModel.aggregate([
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

    const totalCommissionMap = totalCommissionSums.reduce((map, commission) => {
      map[commission._id] = commission;
      return map;
    }, {});

    commissionSums.forEach((commission) => {
      const category = commission._id || "";
      if (categoryData[category]) {
        const totalCommission = totalCommissionMap[category] || {
          totalPayIn: 0,
          totalPayInAmount: 0,
          totalPayInBalance: 0,
          totalPayOut: 0,
          totalPayOutAmount: 0,
          totalPartnerBalance: 0,
        };

        categoryData[category]["PayIn Amount"] = Math.round(commission.totalPayIn);
        categoryData[category]["Broker Amount"] = Math.round(commission.totalPayInAmount);
        categoryData[category]["Broker Balance"] = Math.round(commission.totalPayIn - commission.totalPayInAmount);
        categoryData[category]["PayOut Amount"] = Math.round(commission.totalPayOut);
        categoryData[category]["UnPaid Amount"] = Math.round(commission.totalPayOut - commission.totalPayOutAmount);
        categoryData[category]["Left Distributed Amount"] = Math.round(commission.totalPartnerBalance);
        categoryData[category].Revenue = Math.round(commission.totalPayIn - commission.totalPayOut);

        categoryData[category]["Total UnPaid Amount"] = Math.round(totalCommission.totalPayOut - totalCommission.totalPayOutAmount);
        categoryData[category]["Total Left Distributed Amount"] = Math.round(totalCommission.totalPartnerBalance);
        categoryData[category]["Total Revenue"] = Math.round(totalCommission.totalPayIn - totalCommission.totalPayOut);
      }
    });

    policyCounts.forEach((policy) => {
      const category = policy._id || "";
      if (categoryData[category]) {
        categoryData[category]["Policy Count"] = policy.count;
      }
    });

    netPremiums.forEach((premium) => {
      const category = premium._id || "";
      if (categoryData[category]) {
        categoryData[category]["Net Premium"] = Math.round(premium["Net Premium"]);
        categoryData[category]["Final Premium"] = Math.round(premium["Final Premium"]);
      }
    });

    const bookingCounts = await BookingRequest.aggregate([
      { $match: { createdOn: dateFilter } },
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const formattedBookingCounts = {
      "Accepted Booking": 0,
      "Booked Booking": 0,
      "Requested Booking": 0,
      "Rejected Booking": 0,
    };
    let totalBookingRequest = 0;

    bookingCounts.forEach((booking) => {
      totalBookingRequest += booking.count;
      if (booking._id === "accepted") {
        formattedBookingCounts["Accepted Booking"] = booking.count;
      } else if (booking._id === "booked") {
        formattedBookingCounts["Booked Booking"] = booking.count;
      } else if (booking._id === "requested") {
        formattedBookingCounts["Requested Booking"] = booking.count;
      } else if (booking._id === "Rejected") {
        formattedBookingCounts["Rejected Booking"] = booking.count;
      }
    });

    formattedBookingCounts["Total Booking"] = totalBookingRequest;

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

    const totalAccounts = await Account.countDocuments();
    const totalAmountData = await Account.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalAmount = totalAmountData.length > 0 ? Math.round(totalAmountData[0].totalAmount) : 0;

    const accountsData = await Account.aggregate([
      {
        $group: {
          _id: "$accountCode",
          totalAmount: { $sum: "$amount" },
          accountId: { $first: "$_id" },
        },
      },
    ]);

    const formattedAccounts = {};
    accountsData.forEach((account) => {
      formattedAccounts[account._id] = {
        amount: Math.round(account.totalAmount),
        accountId: account.accountId,
      };
    });

    // Summing up Net Premium and Final Premium across all categories
    const totalNetPremium = netPremiums.reduce((sum, premium) => sum + premium["Net Premium"], 0);
    const totalFinalPremium = netPremiums.reduce((sum, premium) => sum + premium["Final Premium"], 0);

    const data = [
      {
        roleCounts: formattedRoleCounts,
        categories: categoryData,
        bookingRequests: formattedBookingCounts,
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
        accounts: formattedAccounts,
      },
    ];

    res.status(200).json({
      message: "Dashboard Count retrieved successfully",
      data,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
