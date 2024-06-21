import BranchModel from "../../models/branchSchema.js";

// Create a new branch name
const createBranchName = async (req, res) => {
  try {
    const { branchName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!branchName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newbranchName = new BranchModel({
      branchName,
      createdBy,
      updatedBy: null,
      updatedOn: null, 
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newbranchName.save();
    res.status(200).json({
      message: "New branch name created successfully",
      data: newbranchName,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating branch name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new branch name",
      error: error.message,
    });
  }
};

// Get all branch names
const getAllBranchNames = async (req, res) => {
  try {
    const BranchNames = await BranchModel.find();
    res.status(200).json({
      message: "Success! Here are all branch names",
      data: BranchNames,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve branch name" });
  }
};

// Get branch name by ID
const getBranchNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch name exists
    const existingbranchName = await BranchModel.findById(id);
    if (!existingbranchName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Branch name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the branch name with ID",
      data: existingbranchName,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve branch name" });
  }
};

// Update branchName
const updateBranchName = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, updatedBy, isActive } = req.body;

    // Check if branch name exists
    const existingBranchName = await BranchModel.findById(id);
    if (!existingBranchName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Branch name not found" });
    }

    // Update the branch name
    existingBranchName.branchName = branchName;
    existingBranchName.updatedBy = updatedBy;
    existingBranchName.updatedOn = new Date();
    if (isActive !== undefined) {
      existingBranchName.isActive = isActive;
    }

    const updatedBranchName = await existingBranchName.save();

    res.status(200).json({
      message: `Branch name ${id} updated successfully`,
      data: updatedBranchName,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating branch name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update branch name",
    });
  }
};

// Delete branchName
const deleteBranchName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch name exists
    const existingbranchName = await BranchModel.findById(id);
    if (!existingbranchName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Branch name not found" });
    }

    // Delete the branch name
    await BranchModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Branch name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete branch name" });
  }
};

export {
  createBranchName,
  getAllBranchNames,
  getBranchNameById,
  updateBranchName,
  deleteBranchName,
};
