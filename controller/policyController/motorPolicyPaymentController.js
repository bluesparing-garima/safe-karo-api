import mongoose from "mongoose";
import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import debitModel from "../../models/accountsModels/debitsSchema.js";
import creditAndDebitSchema from "../../models/accountsModels/creditAndDebitSchema.js";
import creditModel from "../../models/accountsModels/creditSchema.js";

// Create a new motor policy payment
export const createMotorPolicyPayment = async (req, res) => {
  const {
    partnerId,
    policyId,
    policyNumber,
    bookingId,
    brokerId,
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
    transactionCode,
    isActive,
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
      brokerId,
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
      transactionCode,
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedMotorPolicyPayment = await newMotorPolicyPayment.save();

    if (payOutPaymentStatus === "UnPaid" || payOutPaymentStatus === "Partial") {
      const newDebit = new debitModel({
        policyNumber,
        partnerId,
        transactionCode: transactionCode,
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
        partnerBalance,
        brokerBalance,
        remarks,
        updatedBy,
        updatedOn,
        transactionCode,
        distributedDate,
      }) => {
        let existingPayment = await motorPolicyPayment.findOne({ policyNumber });

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
            partnerBalance,
            brokerBalance,
            createdOn: new Date(),
            transactionCode,
            updatedOn: distributedDate,
            remarks,
          });
        } else {
          existingPayment.payInAmount = payInAmount;
          existingPayment.payInPaymentStatus = payInPaymentStatus;
          existingPayment.payOutAmount = payOutAmount;
          existingPayment.payOutPaymentStatus = payOutPaymentStatus;
          existingPayment.payInBalance = payInBalance;
          existingPayment.payOutBalance = payOutBalance;
          existingPayment.partnerBalance = partnerBalance;
          existingPayment.brokerBalance = brokerBalance;
          existingPayment.updatedOn = distributedDate;
          existingPayment.transactionCode = transactionCode;
          existingPayment.remarks = remarks;
        }

        const savedPayment = await existingPayment.save();

        const policyDate = new Date(existingPayment.policyDate);

        if (["UnPaid", "Partial", "Paid"].includes(payOutPaymentStatus)) {
          const newDebit = new debitModel({
            transactionCode,
            policyNumber,
            partnerId: existingPayment.partnerId,
            payOutAmount,
            payOutCommission,
            payOutPaymentStatus,
            payOutBalance,
            partnerBalance,
            policyDate: policyDate,
            createdBy: existingPayment.createdBy,
            updatedBy,
            createdOn: existingPayment.createdOn,
            updatedOn: updatedOn,
            remarks,
            distributedDate: distributedDate,
          });

          await newDebit.save();
        }

        if (["UnPaid", "Partial", "Paid"].includes(payInPaymentStatus)) {
          const newCredit = new creditModel({
            transactionCode,
            policyNumber,
            brokerId: existingPayment.brokerId,
            brokerBalance,
            payInAmount,
            payInPaymentStatus,
            payInBalance,
            policyDate: policyDate,
            createdBy: existingPayment.createdBy,
            updatedBy,
            createdOn: existingPayment.createdOn,
            updatedOn: updatedOn,
            remarks,
            distributedDate: distributedDate,
          });

          await newCredit.save();
        }

        return savedPayment;
      }
    );

    const savedPayments = await Promise.all(updatePromises);

    res.status(200).json({
      message: "Motor Policy Payments updated successfully",
      data: savedPayments,
      partnerBalance: req.body.partnerBalance,
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

    const normalizedStart = new Date(start.setHours(0, 0, 0, 0));
    const normalizedEnd = new Date(end.setHours(23, 59, 59, 999));

    const results = await motorPolicyPayment.aggregate([
      {
        $match: {
          partnerId,
          policyDate: { $gte: normalizedStart, $lte: normalizedEnd },
          payOutPaymentStatus: { $in: ["UnPaid", "Partial"] },
          isActive: true,
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

// Get UnPaid and Partial Paid by date range and brokerId
export const getBrokerUnPaidAndPartialPaidPayments = async (req, res) => {
  try {
    const { brokerId, startDate, endDate } = req.query;

    if (!brokerId || !startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required query parameters",
        success: false,
        status: "error",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const normalizedStart = new Date(start.setHours(0, 0, 0, 0));
    const normalizedEnd = new Date(end.setHours(23, 59, 59, 999));

    const results = await motorPolicyPayment.aggregate([
      {
        $match: {
          brokerId,
          policyDate: { $gte: normalizedStart, $lte: normalizedEnd },
          payInPaymentStatus: { $in: ["UnPaid", "Partial"] },
          isActive: true,
        },
      },
      {
        $addFields: {
          relevantAmount: {
            $cond: [
              { $eq: ["$payInPaymentStatus", "UnPaid"] },
              "$payInCommission",
              {
                $cond: [
                  { $eq: ["$payInPaymentStatus", "Partial"] },
                  "$payInBalance",
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

    const brokerStatement = await creditAndDebitSchema
      .findOne({ brokerId })
      .sort({ _id: -1 });

    const totalBrokerBalance = brokerStatement?.brokerBalance || 0;

    const result = results[0] || { totalAmount: 0, payments: [] };
    const adjustedTotalAmount = result.totalAmount - totalBrokerBalance;

    res.status(200).json({
      message:
        "Motor policy payments for status UnPaid and Partial Paid retrieved successfully",
      data: {
        payments: result.payments,
        totalAmount: result.totalAmount,
        brokerBalance: totalBrokerBalance,
        adjustedTotalAmount: Math.max(0, adjustedTotalAmount),
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

// Get Paid by date range and partnerId
export const getPaidPayments = async (req, res) => {
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
          payOutPaymentStatus: { $in: ["Paid", "Partial"] },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$payOutAmount" },
          payments: { $push: "$$ROOT" },
        },
      },
    ]);

    const creditAndDebitData = await creditAndDebitSchema
      .findOne({ partnerId })
      .sort({ _id: -1 });
    
    const partnerBalance = creditAndDebitData?.partnerBalance || 0;

    res.status(200).json({
      message: "Motor policy payments for status Paid retrieved successfully",
      data: {
        partnerBalance: partnerBalance,
        totalAmount: results[0]?.totalAmount || 0,
        payments: results[0]?.payments || [],
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

// Get Paid by date range and partnerId
export const getPaidPaymentsOfBroker = async (req, res) => {
  try {
    const { brokerId, startDate, endDate } = req.query;

    if (!brokerId || !startDate || !endDate) {
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
          brokerId,
          policyDate: { $gte: start, $lte: end },
          payInPaymentStatus: { $in: ["Paid", "Partial"] },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$payInCommission" },
          payments: { $push: "$$ROOT" },
        },
      },
    ]);

    const creditAndDebitData = await creditAndDebitSchema
      .findOne({ brokerId })
      .sort({ _id: -1 });
    
    const brokerBalance = creditAndDebitData?.brokerBalance || 0;

    res.status(200).json({
      message: "Motor policy payments for status Paid retrieved successfully",
      data: {
        brokerBalance: brokerBalance,
        totalAmount: results[0]?.totalAmount || 0,
        payments: results[0]?.payments || [],
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
    const motorPolicyPayments = await motorPolicyPayment.find({
      isActive: true,
    });
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
      isActive: true, // Ensure only active records are retrieved
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
    brokerId,
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
        status: "success",
      });
    }

    // Update the motor policy payment
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

    // Explicitly include policyId in the response
    res.status(200).json({
      message: "Motor Policy Payment updated successfully",
      data: {
        ...updatedMotorPolicyPayment.toObject(),
        policyId: updatedMotorPolicyPayment.policyId,
      },
      success: true,
      status: "success",
    });
  } catch (err) {
    res.status(400).json({ message: err.message, status: "error" });
  }
};

// Controller method to update brokerId in MotorPolicyPayment
export const updateAllBrokerIds = async (req, res) => {
  try {
    const motorPolicies = await MotorPolicyModel.find();

    if (!motorPolicies || motorPolicies.length === 0) {
      return res.status(404).json({ message: 'No policies found in MotorPolicy table' });
    }

    for (const policy of motorPolicies) {
      const { policyNumber, brokerId } = policy;

      const updated = await motorPolicyPayment.updateOne(
        { policyNumber },
        { $set: { brokerId } }
      );

      if (updated.nModified === 0) {
        console.warn(`PolicyNumber ${policyNumber} not found or unchanged in MotorPolicyPayment`);
      }
    }

    return res.json({ message: 'Broker IDs updated successfully in MotorPolicyPayment' });
  } catch (error) {
    console.error('Error updating brokerId in MotorPolicyPayment:', error);
    return res.status(500).json({ message: 'Server error' });
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
