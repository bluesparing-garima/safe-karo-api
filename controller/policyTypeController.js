import PolicyTypeModel from "../models/policyType.js";

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

const updatePolicyTypeByName = async (req, res) => {
  try {
    const { policyType } = req.params;
    const updateData = req.body;

    // Check if policy type exists
    const existingPolicyType = await PolicyTypeModel.findOne({policyType});
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }

    // Update the policy type
    const updatedPolicyType = await PolicyTypeModel.findOneAndUpdate(
        {policyType},
        { $set: updateData},
        { new: true}
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

const deletePolicyTypeByName = async (req, res) => {
  try {
    const { policyType } = req.params;

    // Check if policy type exists
    const existingPolicyType = await PolicyTypeModel.findOne({policyType});
    if (!existingPolicyType) {
      return res.status(404).json({ status: "failed", message: "Policy type not found" });
    }

    // Delete the policy type
    await PolicyTypeModel.findOneAndDelete({policyType});
    res.status(200).json({ status: "success", message: "Policy type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to delete policy type" });
  }
};

export { createPolicyType, getAllPolicyTypes, getPolicyTypeByName, updatePolicyTypeByName, deletePolicyTypeByName };
