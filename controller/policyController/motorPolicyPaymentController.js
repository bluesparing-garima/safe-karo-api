import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import mongoose from "mongoose";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import StatementManage from "../../models/accountsModels/statementManageSchema.js";

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

// Get Unpaid and partial paid by date range and partnerId
export const getUnPaidAndPartialPaidPayments = async (req, res) => {
  try {
    const { partnerId, startDate, endDate } = req.query;

    if (!partnerId || !startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required query parameters",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const results = await motorPolicyPayment.aggregate([
      {
        $match: {
          partnerId,
          policyDate: { $gte: start, $lte: end },
          $or: [
            { payOutPaymentStatus: "UnPaid" },
            { payOutPaymentStatus: "Partial" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ["$payOutPaymentStatus", "UnPaid"] },
                "$payOutCommission",
                {
                  $cond: [
                    { $eq: ["$payOutPaymentStatus", "Partial"] },
                    "$payOutBalance",
                    0,
                  ],
                },
              ],
            },
          },
          payments: { $push: "$$ROOT" },
        },
      },
    ]);

    const partnerStatements = await StatementManage.aggregate([
      {
        $match: {
          partnerId: partnerId,
        },
      },
      {
        $group: {
          _id: null,
          totalPartnerBalance: { $sum: "$partnerBalance" },
        },
      },
    ]);

    const totalPartnerBalance =
      partnerStatements.length > 0
        ? partnerStatements[0].totalPartnerBalance
        : 0;

    const result = results[0] || {
      totalAmount: 0,
      payments: [],
    };

    const adjustedTotalAmount = result.totalAmount - totalPartnerBalance;

    res.status(200).json({
      message:
        "Motor policy payments for status Unpaid and Partial Paid retrieved successfully",
      data: {
        payments: result.payments,
        totalAmount: result.totalAmount,
        partnerBalance: totalPartnerBalance,
        adjustedTotalAmount,
      },
      success: true,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policy payments",
      error: error.message,
      success: false,
      status: "error",
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
