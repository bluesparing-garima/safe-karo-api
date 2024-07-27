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

// Get PayIn and PayOut commissions weekly,monthly,yearly.
export const getCommissionSums = async (req, res) => {
  try {
    const { timeframe } = req.query;

    let startDate, groupBy, format, mapFormat;
    switch (timeframe) {
      case "day":
        startDate = moment().startOf("day");
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$policyDate" },
        };
        format = "YYYY-MM-DD";
        mapFormat = (key) => moment(key, "YYYY-MM-DD").format("DD");
        break;
      case "week":
        startDate = moment().startOf("week");
        groupBy = {
          $dateToString: { format: "%Y-%U-%u", date: "$policyDate" },
        }; // Group by year, week number, and day of the week
        format = "YYYY-WW-D";
        mapFormat = (key) => {
          const [year, week, day] = key.split("-");
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = days[parseInt(day) - 1];
          return `${dayName}`; // Format: Year-Week-Day
        };
        break;
      case "month":
        startDate = moment().startOf("month");
        groupBy = { $dateToString: { format: "%Y-%m", date: "$policyDate" } };
        format = "YYYY-MM";
        mapFormat = (key) => moment(key, "YYYY-MM").format("MMM");
        break;
      case "year":
        startDate = moment().startOf("year");
        groupBy = { $dateToString: { format: "%Y", date: "$policyDate" } };
        format = "YYYY";
        mapFormat = (key) => key;
        break;
      default:
        return res.status(400).json({ message: "Invalid timeframe parameter" });
    }

    const pipeline = [
      { $match: { policyDate: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: groupBy,
          totalPayInCommission: { $sum: "$payInCommission" },
          totalPayOutCommission: { $sum: "$payOutCommission" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const commissionData = await motorPolicyPayment.aggregate(pipeline);

    const formattedData = commissionData.reduce((acc, item) => {
      const key = item._id;
      const mappedKey = mapFormat(key);
      acc[mappedKey] = {
        payInCommission: item.totalPayInCommission,
        payOutCommission: item.totalPayOutCommission,
      };
      return acc;
    }, {});

    res.status(200).json({
      message: "Commission sums retrieved successfully",
      data: formattedData,
      success: true,
      status: "success",
    });
  } catch (error) {
    console.error("Error retrieving commission sums:", error.message);
    res.status(500).json({
      message: "Error retrieving commission sums",
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
