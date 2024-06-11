import MotorPolicyModel from "../../models/motorPolicy.js";

// Create Motor Policy
export const createMotorPolicy = async (req, res) => {
  console.log("REQUEST BODY", req.body);

  // Properly destructure req.body directly
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
    iphoneNumber,
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
    documents
  } = req.body;

  // Create the formData object
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
    iphoneNumber,
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
    documents
  };

  console.log("FORM DATA", formData); // Log formData to debug

  // Create a new instance of MotorPolicyModel with formData
  const newForm = new MotorPolicyModel(formData);

  try {
    // Save the new form to the database
    const savedForm = await newForm.save();
    // Respond with the created form data
    res.status(201).json({ status: "success", data: [savedForm] });
  } catch (error) {
    // Handle any errors during the save operation
    res.status(500).json({ status: "error", message: error.message });
  }
};


// Get Motor Policies with Pagination
export const getMotorPolicies = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const forms = await MotorPolicyModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await MotorPolicyModel.countDocuments();

    res.status(200).json({
      status: "success",
      // currentPage: page,
      // totalPages: Math.ceil(totalCount / limit),
      // totalCount,
      data: forms,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Motor Policy by ID
export const getMotorPolicyById = async (req, res) => {
  try {
    const form = await MotorPolicyModel.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ status: "error", message: "Motor Policy not found" });
    }
    res.status(200).json({ status: "success", data: [form] });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update Motor Policy by ID
export const updateMotorPolicy = async (req, res) => {
  console.log("REQUEST BODY", req.body);

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
    iphoneNumber,
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
    documents
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
    iphoneNumber,
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
    documents
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
    res.status(200).json({ status: "success", data: [updatedForm] });
  } catch (error) {
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
    res.status(200).json({ status: "success", message: "Motor Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
