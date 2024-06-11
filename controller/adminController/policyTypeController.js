import PolicyTypeModel from "../../models/policyType.js";

const createPolicyType = async (req, res) => {
  try {
    const { policyType, createdBy } = req.body;

    // Check if policy type already exists
    const existingPolicyType = await PolicyTypeModel.findOne({ policyType });
    if (existingPolicyType) {
      return res.status(400).json({ status: "failed", message: "Policy type already exists" });
    }

    const newPolicyType = new PolicyTypeModel({
      policyType,
      createdBy
    });
    await newPolicyType.save();
    res.status(200).json({
      status: "success",
      data: newPolicyType,
      message: "New policy type created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to create new policy type" });
  }
};

const getAllPolicyTypes = async (req, res) => {
  try {
    const policyTypes = await PolicyTypeModel.find();
    res.status(200).json({
      status: "success",
      data: policyTypes,
      message: "Success! Here are all policy types",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve policy types" });
  }
};
// Get case type by ID
const getPolicyTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if case type exists
    const existingPolicyType = await PolicyTypeModel.findById(id);
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Case type not found" });
    }
    res.status(200).json({
      status: "success",
      data: existingPolicyType,
      message: "Success! Here is the case type with ID",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve case type" });
  }
};

const getPolicyTypeByName  = async (req, res) => {
  try {
    const { policyType } = req.params;
    const policyName = await PolicyTypeModel.findOne({policyType});
    if (!policyName) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }
    res.status(200).json({ status: "success", data: policyName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve policy type" });
  }
};

const getPolicyTypeById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from request parameters
    console.log("Fetching policy type with ID:", id); // Log for debugging

    // Check if policy type exists by ID
    const existingPolicyType = await PolicyTypeModel.findById(id);
    
    if (!existingPolicyType) {
      // If not found, send a 404 response
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }
    // If found, send the data with a success status
    res.status(200).json({
      status: "success",
      data: existingPolicyType,
      message: "Success! Here is the policy type with the specified ID",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching policy type by ID:", error);
    // Send a 500 response with the error message
    res.status(500).json({ status: "failed", message: "Unable to retrieve policy type" });
  }
};

const updatePolicyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if policy type exists
    const existingPolicyType = await PolicyTypeModel.findById(id);
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }

    // Update the policy type
    const updatedPolicyType = await PolicyTypeModel.findByIdAndUpdate(
        id,
        { $set: { ...updateData, updatedBy, updatedOn: new Date() }},
        { new: true, runValidators: true}
    );
    res.status(200).json({
      status: "success",
      data: updatedPolicyType,
      message: "Policy type updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to update policy type" });
  }
};

const deletePolicyType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if policy type exists
    const existingPolicyType = await PolicyTypeModel.findById( id );
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }

    // Delete the policy type
    await PolicyTypeModel.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Policy type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to delete policy type" });
  }
};

export { createPolicyType, getAllPolicyTypes, getPolicyTypeById,getPolicyTypeByName, updatePolicyType, deletePolicyType };

