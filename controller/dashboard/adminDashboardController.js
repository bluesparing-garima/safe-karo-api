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
import CreditAndDebit from "../../models/accountsModels/creditAndDebitSchema.js";
import HolidayCalendar from "../../models/adminModels/holidayCalendarSchema.js";
import Attendance from "../../models/adminModels/attendanceSchema.js";

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

    // Fetch total policies and payments
    const totalPolicies = await MotorPolicyModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $toLower: "$category" },
          policyCount: { $sum: 1 },
          netPremiumTotal: { $sum: "$netPremium" },
          finalPremiumTotal: { $sum: "$finalPremium" },
        },
      },
    ]);

    const totalPayments = await MotorPolicyPaymentModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $toLower: "$category" },
          payInTotal: { $sum: "$payInCommission" },
          payOutTotal: { $sum: "$payOutCommission" },
          payInPaidTotal: {
            $sum: {
              $cond: [
                { $in: ["$payInPaymentStatus", ["Paid", "paid"]] },
                "$payInCommission",
                0,
              ],
            },
          },
          payOutPaidTotal: {
            $sum: {
              $cond: [
                { $in: ["$payOutPaymentStatus", ["Paid", "paid"]] },
                "$payOutCommission",
                0,
              ],
            },
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

    // Merge total policies and payments into totalData
    totalPolicies.forEach((policy) => {
      const category = policy._id || "";
      if (totalData[category]) {
        totalData[category]["Total Policy Count"] = policy.policyCount;
        totalData[category]["Total Net Premium"] = Math.round(policy.netPremiumTotal);
        totalData[category]["Total Final Premium"] = Math.round(policy.finalPremiumTotal);
      }
    });

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

    // Fetch monthly policies and payments
    const monthlyPolicies = await MotorPolicyModel.aggregate([
      { $match: { isActive: true, issueDate: dateFilter } },
      {
        $group: {
          _id: { $toLower: "$category" },
          policyCount: { $sum: 1 },
          netPremiumTotal: { $sum: "$netPremium" },
          finalPremiumTotal: { $sum: "$finalPremium" },
        },
      },
    ]);

    const monthlyPayments = await MotorPolicyPaymentModel.aggregate([
      { $match: { isActive: true, policyDate: dateFilter } },
      {
        $group: {
          _id: { $toLower: "$category" },
          payInTotal: { $sum: "$payInCommission" },
          payOutTotal: { $sum: "$payOutCommission" },
          payInPaidTotal: {
            $sum: {
              $cond: [
                { $in: ["$payInPaymentStatus", ["Paid", "paid"]] },
                "$payInAmount",
                0,
              ],
            },
          },
          payOutPaidTotal: {
            $sum: {
              $cond: [
                { $in: ["$payOutPaymentStatus", ["Paid", "paid"]] },
                "$payOutAmount",
                0,
              ],
            },
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

    // Merge monthly policies and payments into totalData
    monthlyPolicies.forEach((policy) => {
      const category = policy._id || "";
      if (totalData[category]) {
        totalData[category]["Monthly Policy Count"] = policy.policyCount;
        totalData[category]["Monthly Net Premium"] = Math.round(policy.netPremiumTotal);
        totalData[category]["Monthly Final Premium"] = Math.round(policy.finalPremiumTotal);
      }
    });

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
    })

    // Aggregate role counts
    const roleCounts = await UserProfileModel.aggregate([
      { $match: { isActive: true } },
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
    
    const creditAndDebitData = await CreditAndDebit.aggregate([
      {
        $group: {
          _id: "$accountId",
          totalCredits: { $sum: "$credit" },
          totalDebits: { $sum: "$debit" },
        },
      },
    ]);
    
    const formattedAccounts = {};
    accountsData.forEach((account) => {
      const creditDebit = creditAndDebitData.find(cd => String(cd._id) === String(account.accountId)) || {};
      
      formattedAccounts[account._id] = {
        amount: Math.round(account.totalAmount),
        accountId: account.accountId,
        totalCredits: creditDebit.totalCredits || 0,
        totalDebits: creditDebit.totalDebits || 0,
      };
    });

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const leaveDetailsToday = await Attendance.aggregate([
      {
        $match: {
          attendanceType: { $in: ["leave", "half day"] },
          createdOn: { $gte: startOfToday, $lte: endOfToday },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: "$employeeDetails._id",
          employeeName: "$employeeDetails.fullName",
          leaveType: "$attendanceType",
          remarks: "$remarks",  
        },
      },
    ]);

    const leaveCountToday = leaveDetailsToday.length;

    const presentDetailsToday = await Attendance.aggregate([
      {
        $match: {
          attendanceType: "present",
          createdOn: { $gte: startOfToday, $lte: endOfToday },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: "$employeeDetails._id",
          employeeName: "$employeeDetails.fullName",
          department: "$employeeDetails.department",
        },
      },
    ]);

    const presentCountToday = presentDetailsToday.length;

    const monthlyHolidays = await HolidayCalendar.find({
      date: { $gte: new Date(queryStartDate || startDate), $lt: new Date(queryEndDate || endDate) },
    }).select("date name");

    const monthlyHolidayCount = monthlyHolidays.length;

    const yearHolidays = await HolidayCalendar.find({
      date: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1),
      },
    }).select("date name");

    const yearHolidayCount = yearHolidays.length;

    const data = [
      {
        leaveCountToday,
        leaveDetailsToday,
        presentCountToday,
        presentDetailsToday,
        monthlyHolidays: {
          count: monthlyHolidayCount,
          holidays: monthlyHolidays.map((holiday) => ({
            date: holiday.date,
            name: holiday.name,
          })),
        },
        yearTotalHolidays: {
          count: yearHolidayCount,
          holidays: yearHolidays.map((holiday) => ({
            date: holiday.date,
            name: holiday.name,
          })),
        },
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
