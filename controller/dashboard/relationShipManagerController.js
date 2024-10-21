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


export const getRMDashboardCount = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let startDate = new Date(`April 1, ${currentYear}`);
    let endDate = new Date(`March 31, ${currentYear + 1}`);

    if (currentDate > endDate) {
      startDate.setFullYear(currentYear + 1);
      endDate.setFullYear(currentYear + 2);
    }

    const { rmId, startDate: queryStartDate, endDate: queryEndDate } = req.query;

    // Date filter based on query params or default financial year
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
        "Total Left Dist.": 0,
        "Monthly PayIn": 0,
        "Monthly Received PayIn": 0,
        "Monthly PayIn Balance": 0,
        "Monthly PayIn Left Dist.": 0,
        "Total PayOut Amount": 0,
        "Total Paid PayOut Amount": 0,
        "Total PayOut Balance": 0,
        "Total PayOut Left Dist.": 0,
        "Monthly PayOut Amount": 0,
        "Monthly Paid PayOut Amount": 0,
        "Monthly PayOut Balance": 0,
        "Monthly PayOut Left Dist.": 0,
      };
    });

    const policies = await MotorPolicyModel.find({
      isActive: true,
      relationshipManagerId: rmId,
    }).lean();

    // Group policies by category and aggregate the required fields
    policies.forEach((policy) => {
      const category = policy.category?.toLowerCase() || "";
      if (totalData[category]) {
        totalData[category]["Total Policy Count"] += 1;
        totalData[category]["Total Net Premium"] += Math.round(policy.netPremium || 0);
        totalData[category]["Total Final Premium"] += Math.round(policy.finalPremium || 0);
      }
    });

    // Step 2: Get all the policyNumbers from the fetched policies
    const policyNumbers = policies.map((policy) => policy.policyNumber);

    // Step 3: Fetch payment details from MotorPolicyPaymentModel using policyNumbers
    const totalPayments = await MotorPolicyPaymentModel.aggregate([
      {
        $match: {
          isActive: true,
          policyNumber: { $in: policyNumbers },
        },
      },
      {
        $group: {
          _id: { $toLower: "$category" },
          payInTotal: { $sum: "$payInCommission" },
          payOutTotal: { $sum: "$payOutCommission" },
          payInPaidTotal: {
            $sum: { $cond: [{ $in: ["$payInPaymentStatus", ["Paid", "paid"]] }, "$payInCommission", 0] },
          },
          payOutPaidTotal: {
            $sum: { $cond: [{ $in: ["$payOutPaymentStatus", ["Paid", "paid"]] }, "$payOutCommission", 0] },
          },
          payInUnpaidOrPartial: {
            $sum: {
              $cond: [
                { $in: ["$payInPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] },
                { 
                  $cond: [
                    { $eq: ["$payInPaymentStatus", "UnPaid"] }, 
                    "$payInCommission", 
                    "$payInBalance"
                  ]
                },
                0,
              ],
            },
          },
          payOutUnpaidOrPartial: {
            $sum: {
              $cond: [
                { $in: ["$payOutPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] },
                { 
                  $cond: [
                    { $eq: ["$payOutPaymentStatus", "UnPaid"] }, 
                    "$payOutCommission", 
                    "$payOutBalance"
                  ]
                },
                0,
              ],
            },
          },
          brokerBalanceTotal: { $sum: "$brokerBalance" },
          partnerBalanceTotal: { $sum: "$partnerBalance" },
        },
      },
    ]);

    // Merge total payments data into totalData
    totalPayments.forEach((payment) => {
      const category = payment._id || "";
      if (totalData[category]) {
        totalData[category]["Total Revenue"] = Math.round(payment.payInTotal - payment.payOutTotal);
        totalData[category]["Total PayIn Amount"] = Math.round(payment.payInTotal);
        totalData[category]["Total Received PayIn Amount"] = Math.round(payment.payInPaidTotal);
        totalData[category]["Total PayIn Balance"] = Math.round(payment.payInUnpaidOrPartial);
        totalData[category]["Total Left Dist."] = Math.round(payment.brokerBalanceTotal);
        totalData[category]["Total PayOut Amount"] = Math.round(payment.payOutTotal);
        totalData[category]["Total Paid PayOut Amount"] = Math.round(payment.payOutPaidTotal);
        totalData[category]["Total PayOut Balance"] = Math.round(payment.payOutUnpaidOrPartial);
        totalData[category]["Total PayOut Left Dist."] = Math.round(payment.partnerBalanceTotal);
      }
    });

    // Fetch monthly policies data filtered by date and rmId
    const monthlyPolicies = await MotorPolicyModel.find({
      isActive: true,
      relationshipManagerId: rmId,
      issueDate: dateFilter,
    }).lean();

    // Group monthly policies by category and aggregate the required fields
    monthlyPolicies.forEach((policy) => {
      const category = policy.category?.toLowerCase() || "";
      if (totalData[category]) {
        totalData[category]["Monthly Policy Count"] += 1;
        totalData[category]["Monthly Net Premium"] += Math.round(policy.netPremium || 0);
        totalData[category]["Monthly Final Premium"] += Math.round(policy.finalPremium || 0);
      }
    });

    // Fetch payment details for monthly policies
    const monthlyPolicyNumbers = monthlyPolicies.map((policy) => policy.policyNumber);

    const monthlyPayments = await MotorPolicyPaymentModel.aggregate([
      {
        $match: {
          policyDate: dateFilter,
          isActive: true,
          policyNumber: { $in: monthlyPolicyNumbers },
        },
      },
      {
        $group: {
          _id: { $toLower: "$category" },
          payInTotal: { $sum: "$payInCommission" },
          payOutTotal: { $sum: "$payOutCommission" },
          payInPaidTotal: {
            $sum: { $cond: [{ $in: ["$payInPaymentStatus", ["Paid", "paid"]] }, "$payInCommission", 0] },
          },
          payOutPaidTotal: {
            $sum: { $cond: [{ $in: ["$payOutPaymentStatus", ["Paid", "paid"]] }, "$payOutCommission", 0] },
          },
          payInUnpaidOrPartial: {
            $sum: {
              $cond: [
                { $in: ["$payInPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] },
                { 
                  $cond: [
                    { $eq: ["$payInPaymentStatus", "UnPaid"] }, 
                    "$payInCommission", 
                    "$payInBalance"
                  ]
                },
                0,
              ],
            },
          },
          payOutUnpaidOrPartial: {
            $sum: {
              $cond: [
                { $in: ["$payOutPaymentStatus", ["UnPaid", "Partial", "unPaid", "partial"]] },
                { 
                  $cond: [
                    { $eq: ["$payOutPaymentStatus", "UnPaid"] }, 
                    "$payOutCommission", 
                    "$payOutBalance"
                  ]
                },
                0,
              ],
            },
          },
          brokerBalanceTotal: { $sum: "$brokerBalance" },
          partnerBalanceTotal: { $sum: "$partnerBalance" },
        },
      },
    ]);

    // Merge monthly payment data into totalData structure
    monthlyPayments.forEach((payment) => {
      const category = payment._id || "";
      if (totalData[category]) {
        totalData[category]["Monthly Revenue"] = Math.round(payment.payInTotal - payment.payOutTotal);
        totalData[category]["Monthly PayIn"] = Math.round(payment.payInTotal);
        totalData[category]["Monthly Received PayIn"] = Math.round(payment.payInPaidTotal);
        totalData[category]["Monthly PayIn Balance"] = Math.round(payment.payInUnpaidOrPartial);
        totalData[category]["Monthly PayIn Left Dist."] = Math.round(payment.brokerBalanceTotal);
        totalData[category]["Monthly PayOut Amount"] = Math.round(payment.payOutTotal);
        totalData[category]["Monthly Paid PayOut Amount"] = Math.round(payment.payOutPaidTotal);
        totalData[category]["Monthly PayOut Balance"] = Math.round(payment.payOutUnpaidOrPartial);
        totalData[category]["Monthly PayOut Left Dist."] = Math.round(payment.partnerBalanceTotal);
      }
    });

    // Aggregate role counts
    const roleCounts = await UserProfileModel.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { rmId: rmId }, 
            { headRMId: rmId } 
          ]
        }
      },
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

    const distinctRoles = await UserProfileModel.distinct("role", {
      $or: [{ rmId: rmId }, { headRMId: rmId }],
    });

    const formattedRoleCounts = { Total: distinctRoles.length };
    roleCounts.forEach((role) => {
      formattedRoleCounts[role._id] = role.count;
    });

    // Aggregate booking counts
    const bookingCounts = await BookingRequest.aggregate([
      { $match: { createdOn: dateFilter, isActive: true } },
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
      { $match: { createdOn: dateFilter, isActive: true } },
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
          "Products": productTypeCount,
          "SubProducts": subProductTypeCount,
        },
      },
    ];

    // Return the result
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
