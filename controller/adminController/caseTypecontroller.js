import CaseTypeModel from "../../models/caseType.js";

const createCaseType = async (req, res) => {
  console.log("REVIVED REQ", req.body);
  try {
    const { caseType, createdBy } = req.body;

    // Check if case type already exists
    const existingCaseType = await CaseTypeModel.findOne({ caseType });
    if (existingCaseType) {
      return res
        .status(400)
        .json({ status: "failed", message: "Case type already exists" });
    }

    const newCaseType = new CaseTypeModel({
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
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to create new case type" });
  }
};

const getAllCaseTypes = async (req, res) => {
  try {
    const caseTypes = await CaseTypeModel.find();
    res.status(200).json({
      status: "success",
      data: caseTypes,
      message: "Success! Here are all case types",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve case types" });
  }
};

const getCaseTypeByName = async (req, res) => {
  try {
    const { caseType } = req.params;
    const caseName = await CaseTypeModel.findOne({ caseType });
    if (!caseName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Case type not found" });
    }
    res.status(200).json({ status: "success", data: caseName });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve case type" });
  }
};

const updateCaseTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if case type exists
    const existingCaseType = await CaseTypeModel.findById(id);
    if (!existingCaseType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Case type not found" });
    }

    // Update the case type
    const updatedCaseType = await CaseTypeModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } }, // Add updatedBy and updatedAt
      { new: true, runValidators: true }  // Return the updated document and run validation
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


const deleteCaseTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if case type exists
    const existingCaseType = await CaseTypeModel.findById(id);
    if (!existingCaseType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Case type not found" });
    }

    // Delete the case type
    await CaseTypeModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({ status: "success", message: "Case type deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete case type" });
  }
};


export { createCaseType, deleteCaseTypeById, updateCaseTypeById, getCaseTypeByName, getAllCaseTypes };