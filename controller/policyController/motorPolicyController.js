import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import BookingRequestModel from "../../models/bookingModel/bookingRequestSchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import mongoose from "mongoose";
// Create Motor Policy
export const createMotorPolicy = async (req, res) => {
  try {
    const {
      policyStatus,
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      paymentDetails,
      policyType,
      caseType,
      category,
      subCategory,
      companyName,
      broker,
      vehicleAge,
      make,
      model,
      fuelType,
      rto,
      vehicleNumber,
      weight,
      seatingCapacity,
      cc,
      ncb,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      registrationDate,
      endDate,
      issueDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      policyCreatedBy,
      documents,
      productType,
      createdBy,
      isActive,
    } = req.body;

    const newMotorPolicy = new MotorPolicyModel({
      policyStatus,
      partnerId: partnerId || "",
      partnerName: partnerName || "",
      relationshipManagerId: relationshipManagerId || "",
      relationshipManagerName: relationshipManagerName || "",
      paymentDetails: paymentDetails || "",
      policyType,
      caseType,
      category,
      subCategory,
      companyName,
      broker,
      vehicleAge,
      make,
      model,
      fuelType,
      rto,
      vehicleNumber,
      seatingCapacity,
      weight,
      cc,
      ncb,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      registrationDate,
      endDate,
      issueDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      policyCreatedBy,
      documents,
      productType,
      createdBy,
      isActive: isActive !== undefined ? isActive : true, // Set default to true if not provided
      updatedBy: null, // Explicitly set updatedBy to null
      updatedOn: null, // Explicitly set updatedOn to null
    });

    // Check if the policyNumber already exists in MotorPolicy
    const existingMotorPolicy = await MotorPolicyModel.findOne({
      policyNumber,
    });
    if (existingMotorPolicy) {
      return res.status(400).json({
        status: "error",
        message: `Motor Policy with ${policyNumber} already exists.`,
      });
    } else {
      const savedMotorPolicy = await newMotorPolicy.save();
      if (savedMotorPolicy) {
        const existingBookingRequest = await BookingRequestModel.findOne({
          policyNumber,
        });
        if (existingBookingRequest) {
          existingBookingRequest.bookingStatus = "booked";
          await existingBookingRequest.save();

          return res.status(200).json({
            status: "success",
            message: `Policy Number ${policyNumber} booked successfully`,
          });
        } else {
          return res.status(200).json({
            status: "success",
            message: `Policy Number created successfully`,
            data: savedMotorPolicy,
          });
        }
      } else {
        return res.status(400).json({
          status: "error",
          message: `Something went wrong`,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Motor Policies
export const getMotorPolicies = async (req, res) => {
  // const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 20;
  // const skip = (page - 1) * limit;

  try {
    const forms = await MotorPolicyModel.find();
    // .sort({ createdAt: -1 })
    // .skip(skip)
    // .limit(limit);

    const totalCount = await MotorPolicyModel.countDocuments({
      isActive: true,
    });

    res.status(200).json({
      message: "All Motor Policies.",
      data: forms,
      status: "success",
      // totalCount,
      // totalPages: Math.ceil(totalCount / limit),
      // currentPage: page
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get MotorPolicy by partnerId
export const getMotorPolicyByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const policies = await MotorPolicyModel.find({ partnerId });

    if (policies.length === 0) {
      return res.status(404).json({
        message: `No Motor Policy for partnerId ${partnerId}`,
        status: "success",
      });
    }

    res.status(200).json({
      message: "Motor Policies retrieved successfully.",
      data: policies,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policies",
      error: error.message,
    });
  }
};

// Get Motor Policy with Payment Details
export const getMotorPolicyWithPaymentDetails = async (req, res) => {
  try {
    const { policyId } = req.params;
    // const policyWithPaymentDetails = await MotorPolicyModel.aggregate([
    //   {
    //     $match: { _id: mongoose.Types.ObjectId.policyId },
    //   },
    //   {
    //     $lookup: {
    //       from: 'motorPolicyPayments', // Collection name for MotorPolicyPaymentModel
    //     localField: '_id',
    //   foreignField: 'policyId',
    //   as: 'payments',
    //     },
    //   },
    // ]);
    const motorPolicy = await MotorPolicyModel.findById(policyId);
    if (!motorPolicy) {
      return res
        .status(404)
        .json({ message: `Motor Policy with ID ${policyId} not found` });
    }

    // Find motor policy payments by policyId
    const motorPolicyPayments = await MotorPolicyPaymentModel.findOne({
      policyId,
    });

    // Combine motor policy and payments into a single response
    const combinedData = {
      // motorPolicy,
      // motorPolicyPayments,
      policyId: motorPolicy._id,
      policyNumber: motorPolicy.policyNumber,
      fullName: motorPolicy.fullName,
      policyType:motorPolicy.policyType,
      // Add fields from MotorPolicyPaymentModel as needed
      paymentId: motorPolicyPayments._id,
      od: motorPolicyPayments.od,
      tp: motorPolicyPayments.tp,
      payInODPercentage: motorPolicyPayments.payInODPercentage,
    };

    if (combinedData.length === 0) {
      return res.status(404).json({
        message: `No Motor Policy found for policyId ${policyId}`,
        status: "error",
      });
    }

    res.status(200).json({
      message: "Motor Policy with Payment Details retrieved successfully.",
      data: combinedData,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving motor policy with payment details",
      error: error.message,
    });
  }
};

// Check PolicyNumber exist
export const validatePolicyNumber = async (req, res) => {
  try {
    const { policyNumber } = req.query;
    const policyExists = await MotorPolicyModel.exists({ policyNumber });
    if (policyExists) {
      return res.status(200).json({
        message: `Policy number already exists`,
        exist: true,
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: `Policy number does not exist`,
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking policy number",
      error: error.message,
    });
  }
};

// Update Motor Policy by ID
export const updateMotorPolicy = async (req, res) => {
  const {
    policyStatus,
    partnerId,
    partnerName,
    relationshipManagerId,
    relationshipManagerName,
    paymentDetails,
    policyType,
    caseType,
    category,
    subCategory,
    companyName,
    broker,
    vehicleAge,
    make,
    model,
    fuelType,
    rto,
    vehicleNumber,
    seatingCapacity,
    weight,
    cc,
    ncb,
    policyNumber,
    fullName,
    emailId,
    phoneNumber,
    mfgYear,
    tenure,
    registrationDate,
    endDate,
    issueDate,
    idv,
    od,
    tp,
    netPremium,
    finalPremium,
    paymentMode,
    policyCreatedBy,
    documents,
    productType,
    isActive,
    updatedBy,
  } = req.body;

  const formData = {
    policyStatus,
    policyType,
    caseType,
    category,
    subCategory,
    companyName,
    broker,
    vehicleAge,
    make,
    model,
    fuelType,
    rto,
    vehicleNumber,
    seatingCapacity,
    weight,
    cc,
    ncb,
    policyNumber,
    fullName,
    emailId,
    phoneNumber,
    mfgYear,
    tenure,
    registrationDate,
    endDate,
    issueDate,
    idv,
    od,
    tp,
    netPremium,
    finalPremium,
    paymentMode,
    policyCreatedBy,
    documents,
    productType,
    relationshipManagerId,
    relationshipManagerName,
    paymentDetails,
    isActive: isActive !== undefined ? isActive : true,
    updatedBy: updatedBy || "system",
    updatedOn: new Date(),
  };

  // Check if partnerId and partnerName are provided in the request body
  if (partnerId !== undefined) {
    formData.partnerId = partnerId;
  }
  if (partnerName !== undefined) {
    formData.partnerName = partnerName;
  }

  try {
    const updatedForm = await MotorPolicyModel.findByIdAndUpdate(
      req.params.id,
      formData,
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res
        .status(404)
        .json({ status: "error", message: "Motor Policy not found" });
    }

    res.status(200).json({
      message: `Motor Policy with ID ${req.params.id} updated successfully`,
      data: updatedForm,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating motor policy:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete Motor Policy by ID
export const deleteMotorPolicy = async (req, res) => {
  try {
    const deletedForm = await MotorPolicyModel.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res
        .status(404)
        .json({ status: "error", message: "Motor Policy not found" });
    }

    deletedForm.isActive = false;
    await deletedForm.save();

    res.status(200).json({
      status: "success",
      message: "Motor Policy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
