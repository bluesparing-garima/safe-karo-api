import MakeModel from "../../models/adminModels/makeSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
// Create a new make
const createMake = async (req, res) => {
  try {
    const { makeName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!makeName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newmake = new MakeModel({
      makeName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newmake.save();
    res.status(200).json({
      message: "New make created successfully",
      data: newmake,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating make:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new make",
      error: error.message,
    });
  }
};

// Get all makes
const getAllMakes = async (req, res) => {
  try {
    const Makes = await MakeModel.find();
    res.status(200).json({
      message: "Success! Here are all makes",
      data: Makes,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve make" });
  }
};

// Check make exist or not.
export const validateMake = async (req, res) => {
  try {
    const { make } = req.params;
    const makeExists = await MotorPolicyModel.exists({
      make,
    });
    if (makeExists) {
      return res.status(200).json({
        message: `make already exists`,
        exist: true,
        status: "error",
      });
    } else {
      return res.status(200).json({
        message: `make does not exist`,
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking make",
      error: error.message,
    });
  }
};
// Get make by ID
const getMakeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if make exists
    const existingmake = await MakeModel.findById(id);
    if (!existingmake) {
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the make with ID",
      data: existingmake,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve make" });
  }
};

// Update make
const updateMake = async (req, res) => {
  try {
    const { id } = req.params;
    const { makeName, updatedBy, isActive } = req.body;

    // Check if make exists
    const existingMake = await MakeModel.findById(id);
    if (!existingMake) {
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }

    // Update the make
    existingMake.makeName = makeName;
    existingMake.updatedBy = updatedBy;
    existingMake.updatedOn = new Date();
    if (isActive !== undefined) {
      existingMake.isActive = isActive;
    }

    const updatedMake = await existingMake.save();

    res.status(200).json({
      message: `Make name ${id} updated successfully`,
      data: updatedMake,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating make:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update make",
    });
  }
};

// Delete make
const deleteMake = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if make exists
    const existingmake = await MakeModel.findById(id);
    if (!existingmake) {
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }

    // Delete the make
    await MakeModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Make name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete make" });
  }
};

export { createMake, getAllMakes, getMakeById, updateMake, deleteMake };
