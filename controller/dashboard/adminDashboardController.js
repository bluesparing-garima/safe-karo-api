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
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let startDate = new Date(`April 1, ${currentYear}`);
    let endDate = new Date(`March 31, ${currentYear + 1}`);

    if (currentDate > endDate) {
      startDate.setFullYear(currentYear + 1);
      endDate.setFullYear(currentYear + 2);
    }

    const { startDate: queryStartDate, endDate: queryEndDate } = req.query;

    const dateFilter = {
      $gte: new Date(queryStartDate || startDate),
      $lte: new Date(queryEndDate || endDate),
    };

    // Fetch category names
    const categories = await Category.find().lean();
    const categoryNames = categories.map((cat) => cat.categoryName.toLowerCase());

    // Initialize data structure for each category
    const totalData = {};
    categoryNames.forEach((category) => {
      totalData[category] = {
        "Total Policy Count": 0,
        "Total Net Premium": 0,
        "Total Final Premium": 0,
        "Total Revenue": 0,
        "Monthly Policy Count": 0,
        "Monthly Net Premium": 0,
        "Monthly Final Premium": 0,
        "Monthly Revenue": 0,
        "Total PayIn Amount": 0,
        "Total Received PayIn Amount": 0,
        "Total PayIn Balance": 0,
        "Total Left Distributed Amount": 0,
        "Monthly PayIn Amount": 0,
        "Monthly Received PayIn Amount": 0,
        "Monthly PayIn Balance": 0,
        "Monthly Left Distributed Amount": 0,
        "Total PayOut Amount": 0,
        "Total Paid PayOut Amount": 0,
        "Total PayOut Balance": 0,
        "Total PayOut Left Distributed Amount": 0,
        "Monthly PayOut Amount": 0,
        "Monthly Paid PayOut Amount": 0,
        "Monthly PayOut Balance": 0,
        "Monthly PayOut Left Distributed Amount": 0,
      };
    });

    // Fetch total policy data
    const totalPolicies = await MotorPolicyPaymentModel.aggregate([
      {
        $group: {
          _id: { $toLower: "$category" },
          policyCount: { $sum: 1 },
          netPremiumTotal: { $sum: "$netPremium" },
          finalPremiumTotal: { $sum: "$finalPremium" },
          payInTotal: { $sum: "$payInCommission" },
          payOutTotal: { $sum: "$payOutCommission" },
          payInPaidTotal: {
            $sum: { $cond: [{ $in: ["$payInPaymentStatus", ["Paid", "paid"]] }, "$payInCommission", 0] },
          },
          payOutPaidTotal: {
            $sum: { $cond: [{ $in: ["$payOutPaymentStatus", ["Paid", "paid"]] }, "$payOutCommission", 0] },
          },
          payInUnpaidTotal: {
            $sum: { $cond: [{ $in: ["$payInPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] }, "$payInCommission", 0] },
          },
          payOutUnpaidTotal: {
            $sum: { $cond: [{ $in: ["$payOutPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] }, "$payOutCommission", 0] },
          },
          brokerBalanceTotal: { $sum: "$brokerBalance" },
          partnerBalanceTotal: { $sum: "$partnerBalance" },
        },
      },
    ]);

    // Merge total policies data into totalData
    totalPolicies.forEach((policy) => {
      const category = policy._id || "";
      if (totalData[category]) {
        totalData[category]["Total Policy Count"] = policy.policyCount;
        totalData[category]["Total Net Premium"] = policy.netPremiumTotal;
        totalData[category]["Total Final Premium"] = policy.finalPremiumTotal;
        totalData[category]["Total Revenue"] = policy.payInTotal - policy.payOutTotal;
        totalData[category]["Total PayIn Amount"] = policy.payInTotal;
        totalData[category]["Total Received PayIn Amount"] = policy.payInPaidTotal;
        totalData[category]["Total PayIn Balance"] = policy.payInUnpaidTotal;
        totalData[category]["Total Left Distributed Amount"] = policy.brokerBalanceTotal;
        totalData[category]["Total PayOut Amount"] = policy.payOutTotal;
        totalData[category]["Total Paid PayOut Amount"] = policy.payOutPaidTotal;
        totalData[category]["Total PayOut Balance"] = policy.payOutUnpaidTotal;
        totalData[category]["Total PayOut Left Distributed Amount"] = policy.partnerBalanceTotal;
      }
    });

    // Fetch monthly policies data
    const monthlyPolicies = await MotorPolicyPaymentModel.aggregate([
      {
        $match: { policyDate: dateFilter },
      },
      {
        $group: {
          _id: { $toLower: "$category" },
          policyCount: { $sum: 1 },
          netPremiumTotal: { $sum: "$netPremium" },
          finalPremiumTotal: { $sum: "$finalPremium" },
          payInTotal: { $sum: "$payInCommission" },
          payOutTotal: { $sum: "$payOutCommission" },
          payInPaidTotal: {
            $sum: { $cond: [{ $in: ["$payInPaymentStatus", ["Paid", "paid"]] }, "$payInCommission", 0] },
          },
          payOutPaidTotal: {
            $sum: { $cond: [{ $in: ["$payOutPaymentStatus", ["Paid", "paid"]] }, "$payOutCommission", 0] },
          },
          payInUnpaidTotal: {
            $sum: { $cond: [{ $in: ["$payInPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] }, "$payInCommission", 0] },
          },
          payOutUnpaidTotal: {
            $sum: { $cond: [{ $in: ["$payOutPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] }, "$payOutCommission", 0] },
          },
          brokerBalanceTotal: { $sum: "$brokerBalance" },
          partnerBalanceTotal: { $sum: "$partnerBalance" },
        },
      },
    ]);

    // Merge monthly data into the totalData structure
    monthlyPolicies.forEach((policy) => {
      const category = policy._id || "";
      if (totalData[category]) {
        totalData[category]["Monthly Policy Count"] = policy.policyCount;
        totalData[category]["Monthly Net Premium"] = policy.netPremiumTotal;
        totalData[category]["Monthly Final Premium"] = policy.finalPremiumTotal;
        totalData[category]["Monthly Revenue"] = policy.payInTotal - policy.payOutTotal;
        totalData[category]["Monthly PayIn Amount"] = policy.payInTotal;
        totalData[category]["Monthly Received PayIn Amount"] = policy.payInPaidTotal;
        totalData[category]["Monthly PayIn Balance"] = policy.payInUnpaidTotal;
        totalData[category]["Monthly Left Distributed Amount"] = policy.brokerBalanceTotal;
        totalData[category]["Monthly PayOut Amount"] = policy.payOutTotal;
        totalData[category]["Monthly Paid PayOut Amount"] = policy.payOutPaidTotal;
        totalData[category]["Monthly PayOut Balance"] = policy.payOutUnpaidTotal;
        totalData[category]["Monthly PayOut Left Distributed Amount"] = policy.partnerBalanceTotal;
      }
    });

    // Aggregate role counts
    const roleCounts = await UserProfileModel.aggregate([
      {
        $project: {
          normalizedRole: {
            $switch: {
              branches: [
                { case: { $eq: ["$role", "RM"] }, then: "Relationship Manager" },
              ],
              default: "$role",
            },
          },
        },
      },
      { $group: { _id: "$normalizedRole", count: { $sum: 1 } } },
    ]);

    const distinctRoles = await UserProfileModel.distinct("role");
    const formattedRoleCounts = { Total: distinctRoles.length };
    roleCounts.forEach((role) => {
      formattedRoleCounts[role._id] = role.count;
    });

    // Aggregate booking counts
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


    // Aggregate lead counts
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

    // Aggregate admin counts
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

    const data = [
      {
        roleCounts: formattedRoleCounts,
        categories: totalData,
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
