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
import Roles from "../../models/adminModels/roleSchema.js";
import Account from "../../models/accountsModels/accountSchema.js";
// Controller function to get dashboard count
export const getDashboardCount = async (req, res) => {
  try {
    // Count users by role
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

    const formattedRoleCounts = {};
    roleCounts.forEach((role) => {
      formattedRoleCounts[role._id] = role.count;
    });

    // Count policies by category and calculate net and final premiums
    const policyCounts = await MotorPolicyModel.aggregate([
      {
        $group: {
          _id: {
            $toLower: "$category",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const netPremiums = await MotorPolicyModel.aggregate([
      {
        $group: {
          _id: null,
          NetPremium: { $sum: "$netPremium" },
          FinalPremium: { $sum: "$finalPremium" },
        },
      },
      {
        $project: {
          _id: 0,
          NetPremium: 1,
          FinalPremium: 1,
        },
      },
    ]);

    const formattedPolicyCounts = {};
    policyCounts.forEach((policy) => {
      formattedPolicyCounts[policy._id] = policy.count;
    });
    const netPremium = netPremiums.length > 0 ? netPremiums[0].NetPremium : 0;
    const finalPremium =
      netPremiums.length > 0 ? netPremiums[0].FinalPremium : 0;

    // Sum payInCommission and payOutCommission
    const commissionSums = await MotorPolicyPaymentModel.aggregate([
      {
        $group: {
          _id: null,
          totalPayInCommission: { $sum: "$payInCommission" },
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
      {
        $project: {
          _id: 0,
          totalPayInCommission: 1,
          totalPayOutCommission: 1,
        },
      },
    ]);

    const totalPayInCommission =
      commissionSums.length > 0 ? commissionSums[0].totalPayInCommission : 0;
    const totalPayOutCommission =
      commissionSums.length > 0 ? commissionSums[0].totalPayOutCommission : 0;

    // Count booking requests by status
    const bookingCounts = await BookingRequest.aggregate([
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const formattedBookingCounts = {};
    let totalBookingRequest = 0;
    bookingCounts.forEach((booking) => {
      formattedBookingCounts[booking._id] = booking.count;
      totalBookingRequest += booking.count;
    });

    // Count leads by status
    const leadCounts = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formattedLeadCounts = {};
    let totalLead = 0;
    leadCounts.forEach((lead) => {
      formattedLeadCounts[lead._id] = lead.count;
      totalLead += lead.count;
    });
    // Count Roles
    const roleCount = await Roles.countDocuments();
    // Count brokers
    const brokerCount = await Broker.countDocuments();

    // Count makes
    const makeCount = await Make.countDocuments();

    // Count models
    const modelCount = await Model.countDocuments();

    // Count categories
    const categoryCount = await Category.countDocuments();

    // Count companies
    const companyCount = await Company.countDocuments();

    // Count product types
    const productTypeCount = await ProductType.countDocuments();

    // Count sub-product types
    const subProductTypeCount = await SubProductType.countDocuments();

    // Prepare bookingRequests dynamically
    const bookingRequests = {
      "Total Booking": totalBookingRequest,
    };
    Object.keys(formattedBookingCounts).forEach((key) => {
      bookingRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Booking`] =
        formattedBookingCounts[key];
    });

    // Prepare leadCounts dynamically
    const leadRequests = {
      "Total Lead": totalLead,
    };
    Object.keys(formattedLeadCounts).forEach((key) => {
      leadRequests[`${key.charAt(0).toUpperCase()}${key.slice(1)} Lead`] =
        formattedLeadCounts[key];
    });
    // Count the number of accounts
    const totalAccounts = await Account.countDocuments();

    // Sum the total amount across all accounts
    const totalAmountData = await Account.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount =
      totalAmountData.length > 0 ? totalAmountData[0].totalAmount : 0;

    // Prepare final response data
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
            "PayIn Commission": totalPayInCommission,
            "PayOut Commission": totalPayOutCommission,
          },
          bookingRequests: bookingRequests,
          leadCounts: leadRequests,
          adminCounts: {
            Roles: roleCount,
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
