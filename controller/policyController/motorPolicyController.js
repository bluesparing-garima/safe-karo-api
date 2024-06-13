// controllers/motorPolicyController.js
import MotorPolicyModel from "../../models/motorpolicySchema.js";

// Create Motor Policy
export const createMotorPolicy = async (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      relationshipManagerId,
      relationshipManagerName,
      policyType,
      caseType,
      policyCategory,
      category,
      subCategory,
      companyName,
      broker,
      make,
      model,
      fuelType,
      rto,
      vehicleNumber,
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
      isActive // Add isActive to capture from request body
    } = req.body;

    const newMotorPolicy = new MotorPolicyModel({
      partnerId: partnerId || "",
      partnerName: partnerName || "",
      relationshipManagerId: relationshipManagerId || "",
      relationshipManagerName: relationshipManagerName || "",
      policyType,
      caseType,
      policyCategory,
      category,
      subCategory,
      companyName,
      broker,
      make,
      model,
      fuelType,
      rto,
      vehicleNumber,
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
      isActive: isActive !== undefined ? isActive : true // Set default to true if not provided
    });

    const savedMotorPolicy = await newMotorPolicy.save();
    res.status(201).json({
      status: "success",
      message: "Motor Policy created successfully",
      data: savedMotorPolicy
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Motor Policies with Pagination
export const getMotorPolicies = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const forms = await MotorPolicyModel.find({ isActive: true }) // Retrieve only active motor policies
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await MotorPolicyModel.countDocuments({ isActive: true }); // Count only active motor policies

    res.status(200).json({
      status: "success",
      data: forms,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Motor Policy by ID
export const getMotorPolicyById = async (req, res) => {
  try {
    const form = await MotorPolicyModel.findById(req.params.id);
    if (!form || !form.isActive) {
      return res.status(404).json({ status: "error", message: "Motor Policy not found" });
    }
    res.status(200).json({ status: "success", data: form });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update Motor Policy by ID
export const updateMotorPolicy = async (req, res) => {
  const {
    policyType,
    caseType,
    policyCategory,
    category,
    subCategory,
    companyName,
    broker,
    make,
    model,
    fuelType,
    rto,
    vehicleNumber,
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
    isActive // Add isActive to capture from request body
  } = req.body;

  const formData = {
    policyType,
    caseType,
    policyCategory,
    category,
    subCategory,
    companyName,
    broker,
    make,
    model,
    fuelType,
    rto,
    vehicleNumber,
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
    isActive: isActive !== undefined ? isActive : true // Set default to true if not provided
  };

  try {
    const updatedForm = await MotorPolicyModel.findByIdAndUpdate(
      req.params.id,
      formData,
      { new: true }
    );
    if (!updatedForm) {
      return res.status(404).json({ status: "error", message: "Motor Policy not found" });
    }
    res.status(200).json({ status: "success", data: updatedForm });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete Motor Policy by ID
export const deleteMotorPolicy = async (req, res) => {
  try {
    const deletedForm = await MotorPolicyModel.findById(req.params.id);
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
