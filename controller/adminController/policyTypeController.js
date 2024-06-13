import PolicyTypeModel from "../../models/policyTypeSchema.js";

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

const getPolicyTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if policy type exists
    const existingPolicyType = await PolicyTypeModel.findById(id);
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }
    res.status(200).json({
      status: "success",
      data: existingPolicyType,
      message: "Success! Here is the policy type with ID",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve policy type" });
  }
};

const getPolicyTypeByName = async (req, res) => {
  try {
    const { policyType } = req.params;
    const policyName = await PolicyTypeModel.findOne({ policyType });
    if (!policyName) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }
    res.status(200).json({ status: "success", data: policyName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve policy type" });
  }
};

// Update policy type by ID
const updatePolicyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, isActive, ...updateData } = req.body;

    // Check if policy type exists
    const existingPolicyType = await PolicyTypeModel.findById(id);
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }

    // Update the policy type fields
    Object.keys(updateData).forEach((key) => {
      existingPolicyType[key] = updateData[key];
    });

    // Manually update isActive if provided in the request body
    if (isActive !== undefined) {
      existingPolicyType.isActive = isActive;
    }

    // Set updatedBy and updatedOn fields
    existingPolicyType.updatedBy = updatedBy;
    existingPolicyType.updatedOn = new Date();

    // Save the updated policy type
    const updatedPolicyType = await existingPolicyType.save();

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
    const existingPolicyType = await PolicyTypeModel.findById(id);
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

export { createPolicyType, getAllPolicyTypes, getPolicyTypeById, getPolicyTypeByName, updatePolicyType, deletePolicyType };
