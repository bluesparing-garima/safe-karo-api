import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import mongoose from "mongoose";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import moment from "moment";

// Create a new motor policy payment
export const createMotorPolicyPayment = async (req, res) => {
  const {
    partnerId,
    policyId,
    policyNumber,
    bookingId,
    od,
    tp,
    netPremium,
    finalPremium,
    payInODPercentage,
    payInTPPercentage,
    payInODAmount,
    payInTPAmount,
    payOutODPercentage,
    payOutTPPercentage,
    payOutODAmount,
    payOutTPAmount,
    payInCommission,
    payOutCommission,
    payInAmount,
    payOutAmount,
    payInPaymentStatus,
    payOutPaymentStatus,
    payInBalance,
    payOutBalance,
    createdBy,
  } = req.body;

  try {
    // Check if policyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({
        message: "Invalid policyId",
        success: false,
        status: "error",
      });
    }

    // Fetch MotorPolicy using policyId
    const motorPolicy = await MotorPolicyModel.findById(policyId);

    if (!motorPolicy) {
      return res.status(404).json({
        message: "Motor Policy not found",
        success: false,
        status: "error",
      });
    }

    const newMotorPolicyPayment = new motorPolicyPayment({
      partnerId,
      policyId,
      policyNumber,
      bookingId,
      od,
      tp,
      netPremium,
      finalPremium,
      payInODPercentage,
      payInTPPercentage,
      payInODAmount,
      payInTPAmount,
      payOutODPercentage,
      payOutTPPercentage,
      payOutODAmount,
      payOutTPAmount,
      payInCommission,
      payOutCommission,
      payInAmount,
      payOutAmount,
      payInPaymentStatus,
      payOutPaymentStatus,
      payInBalance,
      payOutBalance,
      policyDate: motorPolicy.createdOn,
      createdBy,
    });

    const savedMotorPolicyPayment = await newMotorPolicyPayment.save();
    res.status(201).json({
      message: "Motor Policy Payment created successfully",
      data: savedMotorPolicyPayment,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false,
      status: "error",
    });
  }
};

// policy Status Manage
export const policyStatusManage = async (req, res) => {
  const policyUpdates = req.body;

  try {
    const updatePromises = policyUpdates.map(
      async ({
        policyNumber,
        payInAmount,
        payOutAmount,
        payInPaymentStatus,
        payOutPaymentStatus,
        payInBalance,
        payOutBalance,
      }) => {
        let existingPayment = await motorPolicyPayment.findOne({
          policyNumber,
        });

        if (!existingPayment) {
          // Create a new payment record
          existingPayment = new motorPolicyPayment({
            policyNumber,
            payInAmount,
            payOutAmount,
            payInPaymentStatus,
            payOutPaymentStatus,
            payInBalance,
            payOutBalance,
          });
        } else {
          existingPayment.payInAmount = payInAmount;
          existingPayment.payInPaymentStatus = payInPaymentStatus;
          existingPayment.payOutAmount = payOutAmount;
          existingPayment.payOutPaymentStatus = payOutPaymentStatus;
          existingPayment.payInBalance = payInBalance;
          existingPayment.payOutBalance = payOutBalance;
          existingPayment.updatedOn = Date.now();
        }

        return existingPayment.save();
      }
    );

    const savedPayments = await Promise.all(updatePromises);

    res.status(200).json({
      message: "Motor Policy Payments updated successfully",
      data: savedPayments,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      message: "Motor Policy Payment Failed to Update",
      error: err.message,
      success: false,
      status: "error",
    });
  }
};

// Helper function to generate all periods
const generatePeriods = (startDate, endDate, timeframe) => {
  const periods = {};
  let currentDate = moment(startDate);
  while (currentDate <= moment(endDate)) {
    const key = currentDate.format(
      {
        day: "ddd",
        week: "ddd",
        month: "MMM",
        year: "YYYY",
      }[timeframe]
    );

    periods[key] = 0;

    if (timeframe === "day" || timeframe === "week") {
      currentDate.add(1, "day");
    } else if (timeframe === "month") {
      currentDate.add(1, "month");
    } else if (timeframe === "year") {
      currentDate.add(1, "year");
    }
  }
  return periods;
};

// Get payOut commission for partner by week,month,year wise
export const getPayOutCommissionByPartner = async (req, res) => {
  const { partnerId, timeframe } = req.query;

  if (!partnerId || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Partner ID and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, format, mapFormat;
  switch (timeframe) {
    case "day":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
    case "week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
    case "month":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%m", date: "$policyDate" } };
      format = "MM";
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
      format = "YYYY";
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    // Generate all periods for the given timeframe
    const periods = generatePeriods(startDate, endDate, timeframe);

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          partnerId,
          policyDate: {
            $gte: moment().startOf("year").toDate(),
            $lte: moment().endOf("year").toDate(),
          },
        },
      }, // Adjust match to include whole year
      {
        $group: {
          _id: groupBy,
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const commissionData = await motorPolicyPayment.aggregate(pipeline);

    // Merge results with periods
    commissionData.forEach((item) => {
      const key = item._id;
      const mappedKey = mapFormat(key);
      periods[mappedKey] = item.totalPayOutCommission;
    });

    res.status(200).json({
      message: "PayOut commissions retrieved successfully",
      data: periods,
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving PayOut commissions:", error.message);
    res.status(500).json({
      message: "Error retrieving PayOut commissions",
      success: false,
      error: error.message,
    });
  }
};

// Get policy count for partner by week,month,year wise
export const getMotorPolicyCountsByPartner = async (req, res) => {
  const { partnerId, timeframe } = req.query;

  if (!partnerId || !timeframe) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Partner ID and timeframe are required.",
    });
  }

  let startDate, endDate, groupBy, format, mapFormat;
  switch (timeframe) {
    case "day":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
    case "week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      groupBy = { $dayOfWeek: "$policyDate" };
      format = "d";
      mapFormat = (key) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[key - 1];
      };
      break;
    case "month":
      startDate = moment().startOf("year"); // Adjust start date to the beginning of the year
      endDate = moment().endOf("year"); // Adjust end date to the end of the year
      groupBy = { $dateToString: { format: "%m", date: "$policyDate" } };
      format = "MM";
      mapFormat = (key) => moment(key, "MM").format("MMM");
      break;
    case "year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
      format = "YYYY";
      mapFormat = (key) => key;
      break;
    default:
      return res.status(400).json({ message: "Invalid timeframe parameter" });
  }

  try {
    // Generate all periods for the given timeframe
    const periods = generatePeriods(startDate, endDate, timeframe);

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          partnerId,
          policyDate: {
            $gte: moment().startOf("year").toDate(),
            $lte: moment().endOf("year").toDate(),
          },
        },
      }, // Adjust match to include whole year
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const policyCounts = await motorPolicyPayment.aggregate(pipeline);

    // Merge results with periods
    policyCounts.forEach((item) => {
      const key = item._id;
      const mappedKey = mapFormat(key);
      periods[mappedKey] = item.count;
    });

    res.status(200).json({
      message: "Motor policy counts retrieved successfully",
      data: periods,
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving motor policy counts:", error.message);
    res.status(500).json({
      message: "Error retrieving motor policy counts",
      success: false,
      error: error.message,
    });
  }
};

// Get all motor policy payments
export const getAllMotorPolicyPayments = async (req, res) => {
  try {
    const motorPolicyPayments = await motorPolicyPayment.find();
    res.status(200).json({
      message: "All Motor Policy Payments retrieved successfully",
      data: motorPolicyPayments,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
      status: "error",
    });
  }
};

// Get motor policy payment by policyId
export const getMotorPolicyPaymentByPolicyId = async (req, res) => {
  try {
    const motorPolicyPaymentData = await motorPolicyPayment.findOne({
      policyId: req.params.policyId,
    });
    if (!motorPolicyPaymentData) {
      return res.status(404).json({
        message: "Motor Policy Payment not found",
        success: false,
        status: "error",
      });
    }
    res.status(200).json({
      message: "Motor Policy Payment retrieved successfully",
      success: true,
      data: motorPolicyPaymentData,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
      status: "error",
    });
  }
};

// Update a motor policy payment by ObjectId
export const updateMotorPolicyPayment = async (req, res) => {
  const {
    partnerId,
    policyId,
    policyNumber,
    bookingId,
    od,
    tp,
    netPremium,
    finalPremium,
    payInODPercentage,
    payInTPPercentage,
    payInODAmount,
    payInTPAmount,
    payOutODPercentage,
    payOutTPPercentage,
    payOutODAmount,
    payOutTPAmount,
    payInCommission,
    payOutCommission,
    updatedBy,
  } = req.body;

  try {
    const existingProfile = await motorPolicyPayment.findOne({
      policyId: req.params.policyId,
    });

    if (!existingProfile) {
      return res.status(404).json({
        message: "Motor Policy Payment not found",
        success: false,
        status: "error",
      });
    }

    const updatedMotorPolicyPayment =
      await motorPolicyPayment.findByIdAndUpdate(
        existingProfile._id,
        req.body,
        { new: true }
      );

    if (!updatedMotorPolicyPayment) {
      return res.status(404).json({
        message: "Motor Policy Payment not found",
        success: false,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Motor Policy Payment updated successfully",
      data: updatedMotorPolicyPayment,
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(400).json({ message: err.message, status: "error" });
  }
};

// Delete a motor policy payment by ObjectId
export const deleteMotorPolicyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid ID", success: false, status: "error" });
    }
    const deletedMotorPolicyPayment =
      await motorPolicyPayment.findByIdAndDelete(id);
    if (!deletedMotorPolicyPayment) {
      return res.status(404).json({
        message: "Motor Policy Payment not found",
        success: false,
        status: "error",
      });
    }
    res.status(200).json({
      message: "Motor Policy Payment deleted successfully",
      success: true,
      status: "success",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message, success: false, status: "error" });
  }
};
