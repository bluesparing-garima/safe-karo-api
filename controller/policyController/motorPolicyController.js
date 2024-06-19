
// controllers/motorPolicyController.js
import MotorPolicyModel from "../../models/motorpolicySchema.js";

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
      engine,
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
      isActive // Add isActive to capture from request body
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
      engine,
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
      isActive: isActive !== undefined ? isActive : true, // Set default to true if not provided
      updatedBy: null, // Explicitly set updatedBy to null
      updatedOn: null, // Explicitly set updatedOn to null
    });

    const savedMotorPolicy = await newMotorPolicy.save();
    res.status(201).json({
      message: "Motor Policy created successfully",
      data: savedMotorPolicy,
      status: "success",
    });
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
    const forms = await MotorPolicyModel.find() 
      // .sort({ createdAt: -1 })
      // .skip(skip)
      // .limit(limit);

     const totalCount = await MotorPolicyModel.countDocuments({ isActive: true });

    res.status(200).json({
      message:"All Motor Policy's.",
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

// Get Motor Policy by partnerId
export const getMotorPolicyById = async (req, res) => {
  try {
    const { partnerId } = req.params; // Extract the partnerId from the request parameters

    const policy = await MotorPolicyModel.findOne({ partnerId });

    if (!policy) {
      return res.status(404).json({ status: "error", message: "Motor Policy not found" });
    }

    res.status(200).json({
      message: `Motor Policy with Partner ID ${partnerId} retrieved successfully`,
      data: policy,
      status: "success"
    });
  } catch (error) {
    console.error("Error retrieving motor policy by partnerId:", error);
    res.status(500).json({ status: "error", message: error.message });
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
    engine,
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
    engine,
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
    product,
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
      return res.status(404).json({ status: "error", message: "Motor Policy not found" });
    }

    res.status(200).json({
      message: `Motor Policy with ID ${req.params.id} updated successfully`,
      data: updatedForm,
      status: "success"
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
      return res.status(404).json({ status: "error", message: "Motor Policy not found" });
    }

    deletedForm.isActive = false; // Soft delete by marking isActive as false
    await deletedForm.save();

    res.status(200).json({ status: "success", message: "Motor Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
