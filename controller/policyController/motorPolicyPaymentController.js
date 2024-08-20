import mongoose from "mongoose";
import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import debitModel from "../../models/accountsModels/debitsSchema.js";
import creditAndDebitSchema from "../../models/accountsModels/creditAndDebitSchema.js";

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
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({
        message: "Invalid policyId",
        success: false,
        status: "error",
      });
    }

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
      policyDate: motorPolicy.issueDate,
      createdBy,
    });

    const savedMotorPolicyPayment = await newMotorPolicyPayment.save();

    if (payOutPaymentStatus === "UnPaid" || payOutPaymentStatus === "Partial") {
      const newDebit = new debitModel({
        policyNumber,
        partnerId,
        paidAmount: payOutAmount,
        payOutAmount: payOutCommission,
        payOutPaymentStatus,
        payOutBalance,
        policyDate: motorPolicy.issueDate,
        createdBy,
        updatedBy: createdBy,
        createdOn: new Date(),
        updatedOn: new Date(),
      });

      await newDebit.save();
    }

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

// Policy Status Manage
export const policyStatusManage = async (req, res) => {
  const policyUpdates = req.body;

  try {
    const updatePromises = policyUpdates.map(
      async ({
        policyNumber,
        payInAmount,
        payOutAmount,
        payOutCommission,
        payInPaymentStatus,
        payOutPaymentStatus,
        payInBalance,
        payOutBalance,
        updatedBy,
        updatedOn,
      }) => {
        let existingPayment = await motorPolicyPayment.findOne({
          policyNumber,
        });

        if (!existingPayment) {
          existingPayment = new motorPolicyPayment({
            policyNumber,
            payInAmount,
            payOutAmount,
            payOutCommission,
            payInPaymentStatus,
            payOutPaymentStatus,
            payInBalance,
            payOutBalance,
            createdOn: new Date(),
            updatedOn,
          });
        } else {
          existingPayment.payInAmount = payInAmount;
          existingPayment.payInPaymentStatus = payInPaymentStatus;
          existingPayment.payOutAmount = payOutAmount;
          existingPayment.payOutPaymentStatus = payOutPaymentStatus;
          existingPayment.payInBalance = payInBalance;
          existingPayment.payOutBalance = payOutBalance;
          existingPayment.updatedOn = updatedOn;
        }

        const savedPayment = await existingPayment.save();

        if (["UnPaid", "Partial", "Paid"].includes(payOutPaymentStatus)) {
          let existingDebit = await debitModel.findOne({ policyNumber });

          const policyDate = new Date(existingPayment.policyDate);

          if (existingDebit) {
            // Update existing debit record
            existingDebit.payOutAmount = payOutAmount;
            existingDebit.payOutCommission = payOutCommission;
            existingDebit.payOutPaymentStatus = payOutPaymentStatus;
            existingDebit.payOutBalance = payOutBalance;
            existingDebit.updatedBy = updatedBy;
            existingDebit.updatedOn = updatedOn;
            existingDebit.policyDate = policyDate;
            await existingDebit.save();
          } else {
            const newDebit = new debitModel({
              transactionCode,
              policyNumber,
              partnerId: existingPayment.partnerId,
              payOutAmount,
              payOutCommission,
              payOutPaymentStatus,
              payOutBalance,
              policyDate: policyDate,
              createdBy: existingPayment.createdBy,
              updatedBy,
              createdOn: existingPayment.createdOn,
              updatedOn: updatedOn,
            });

            await newDebit.save();
          }
        }

        return savedPayment;
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

// Get UnPaid and Partial Paid by date range and partnerId
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
          payOutPaymentStatus: { $in: ["UnPaid", "Partial"] },
        },
      },
      {
        $addFields: {
          relevantAmount: {
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
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$relevantAmount" },
          payments: { $push: "$$ROOT" },
        },
      },
    ]);

    const partnerStatement = await creditAndDebitSchema
      .findOne({ partnerId })
      .sort({ _id: -1 });

    const totalPartnerBalance = partnerStatement
      ? partnerStatement.partnerBalance
      : 0;

    const result = results[0] || { totalAmount: 0, payments: [] };
    const adjustedTotalAmount = result.totalAmount - totalPartnerBalance;

    res.status(200).json({
      message:
        "Motor policy payments for status UnPaid and Partial Paid retrieved successfully",
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

// Update motor policy payment by policyId
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

// Delete motor policy payment by policyId
export const deleteMotorPolicyPayment = async (req, res) => {
  try {
    const deletedMotorPolicyPayment = await motorPolicyPayment.findOneAndDelete(
      {
        policyId: req.params.policyId,
      }
    );
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
    res.status(500).json({
      message: err.message,
      success: false,
      status: "error",
    });
  }
};
