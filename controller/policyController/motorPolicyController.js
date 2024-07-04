import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import BookingRequestModel from "../../models/bookingModel/bookingRequestSchema.js";

// Create Motor Policy
export const createMotorPolicy = async (req, res) => {
  try {
    const {
      tpPercentage,
      odPercentage,
      odPayoutAmount,
      tpPayoutAmount,
      policyStatus,
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      bookingId,
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
      tpPercentage,
      odPercentage,
      odPayoutAmount,
      tpPayoutAmount,
      policyStatus,
      partnerId: partnerId || "",
      partnerName: partnerName || "",
      relationshipManagerId: relationshipManagerId || "",
      relationshipManagerName: relationshipManagerName || "",
      paymentDetails: paymentDetails || "",
      bookingId: bookingId || "",
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
    const existingMotorPolicy = await MotorPolicyModel.findOne({ policyNumber });
    if (existingMotorPolicy) {
      return res.status(400).json({
        status: "error",
        message: `Motor Policy with ${policyNumber} already exists.`,
      });
    } else {
      const savedMotorPolicy = await newMotorPolicy.save();
      if (savedMotorPolicy) {
        const existingBookingRequest = await BookingRequestModel.findOne({ policyNumber });
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

    const totalCount = await MotorPolicyModel.countDocuments({ isActive: true });

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

// Get motorpolicy by bookingId
export const getMotorPolicyByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const policies = await MotorPolicyModel.find({ bookingId });

    if (policies.length === 0) {
      return res.status(404).json({
        message: `No Motor Policy for bookingId ${bookingId}`,
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
    tpPercentage,
    odPercentage,
      odPayoutAmount,
      tpPayoutAmount,
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
    isActive, // Add isActive to capture from request body
    updatedBy, // Assume this is provided in the request
  } = req.body;

  const formData = {
    tpPercentage,
    odPercentage,
      odPayoutAmount,
      tpPayoutAmount,
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
    isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    updatedBy: updatedBy || "system", // Set to 'system' or user info if not provided
    updatedOn: new Date(), // Set the current date for updatedOn
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

    deletedForm.isActive = false; // Soft delete by marking isActive as false
    await deletedForm.save();

    res.status(200).json({
      status: "success",
      message: "Motor Policy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
