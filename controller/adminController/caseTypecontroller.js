import CaseTypesModel from "../../models/caseType.js";

// Create a new case type
const createCaseType = async (req, res) => {
  try {
    const { caseType, createdBy } = req.body;

    // Check if all required fields are provided
    if (!caseType || !createdBy) {
      return res.status(400).json({ status: "failed", message: "Required fields are missing" });
    }

    // Check if case type already exists
    const existingCaseType = await CaseTypesModel.findOne({ caseType });
    if (existingCaseType) {
      return res.status(400).json({ status: "failed", message: "Case type already exists" });
    }

    const newCaseType = new CaseTypesModel({
      caseType,
      createdBy
    });

    await newCaseType.save();
    res.status(200).json({
      status: "success",
      data: newCaseType,
      message: "New case type created successfully",
    });
  } catch (error) {
    console.error("Error creating case type:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new case type",
      error: error.message,
    });
  }
};

// Get all case types
const getAllCaseTypes = async (req, res) => {
  try {
    const caseTypes = await CaseTypesModel.find();
    res.status(200).json({
      status: "success",
      data: caseTypes,
      message: "Success! Here are all case types",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve case types" });
  }
};

// Get case type by name
const getCaseTypeByName = async (req, res) => {
  try {
    const { caseType } = req.params;
    const caseName = await CaseTypesModel.findOne({ caseType });
    if (!caseName) {
      return res.status(404).json({ status: "failed", message: "Case type not found" });
    }
    res.status(200).json({ status: "success", data: caseName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve case type" });
  }
};

// Get case type by ID
const getCaseTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if case type exists
    const existingCaseType = await CaseTypesModel.findById(id);
    if (!existingCaseType) {
      return res.status(404).json({ status: "failed", message: "Case type not found" });
    }
    res.status(200).json({
      status: "success",
      data: existingCaseType,
      message: "Success! Here is the case type with ID",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to retrieve case type" });
  }
};

// Update case type
const updateCaseType = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if case type exists
    const existingCaseType = await CaseTypesModel.findById(id);
    if (!existingCaseType) {
      return res.status(404).json({ status: "failed", message: "Case type not found" });
    }

    // Update the case type
    const updatedCaseType = await CaseTypesModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: updatedCaseType,
      message: `Case type ${id} updated successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update case type",
    });
  }
};

// Delete case type
const deleteCaseType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if case type exists
    const existingCaseType = await CaseTypesModel.findById(id);
    if (!existingCaseType) {
      return res.status(404).json({ status: "failed", message: "Case type not found" });
    }

    // Delete the case type
    await CaseTypesModel.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Case type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to delete case type" });
  }
};

export { createCaseType, getCaseTypeById, deleteCaseType, updateCaseType, getCaseTypeByName, getAllCaseTypes };
