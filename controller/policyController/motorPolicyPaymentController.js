import motorPolicyPayment from "../../models/policyModel/motorPolicyPaymentSchema.js";
import mongoose from "mongoose";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

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
      policyDate: motorPolicy.createdOn, // Assign createdOn date from MotorPolicyModel
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
    //const { policiesId } = ;
    // if (!mongoose.Types.ObjectId.isValid.policyId) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid ID", success: false, status: "error" });
    // }
    //Check POlicyId
    const existingProfile = await motorPolicyPayment.findOne({
      policyId: req.params.policyId,
    });
    if (existingProfile) {
      const updatedMotorPolicyPayment =
        await motorPolicyPayment.findByIdAndUpdate(
          existingProfile._id,
          req.body,
          { new: true }
        );
      console.log("updatedMotorPolicyPayment", updatedMotorPolicyPayment);
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
    }
    return res.status(404).json({
      message: "Motor Policy Payment not found",
      success: false,
      status: "error",
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
