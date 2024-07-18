import Make from "../../models/adminModels/makeSchema.js";
import mongoose from "mongoose";
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

    const existingMake = await Make.findOne({
      makeName,
    });
    if (existingMake) {
      return res.status(409).json({
        status: "failed",
        message: "Make with the same makeName already exists",
      });
    }

    const newMake = new Make({
      makeName,
      createdBy,
      updatedBy: null,
      updatedOn: null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newMake.save();
    res.status(200).json({
      message: "New make created successfully",
      data: newMake,
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
    const makes = await Make.find();
    res.status(200).json({
      message: "Success! Here are all makes",
      data: makes,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve makes" });
  }
};

// Check if make exists or not
const validateMake = async (req, res) => {
  try {
    const { make } = req.params;
    const normalizedMake = make.toLowerCase();

    // const makeExists = await Make.exists({ makeName: normalizedMake });
    const makeExists = await Make.findOne({
      makeName: { $regex: new RegExp(`^${normalizedMake}$`, "i") },
    });
    if (makeExists) {
      return res.status(200).json({
        message: "Make already exists",
        exist: true,
        status: "error",
      });
    } else {
      return res.status(200).json({
        message: "Make does not exist",
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
    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Make ID",
        status: "error",
      });
    }
    // Check if make exists
    const existingMake = await Make.findById(id);
    if (!existingMake) {
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the make with ID",
      data: existingMake,
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
    const existingMake = await Make.findById(id);
    if (!existingMake) {
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }

    // Update the make
    existingMake.makeName = makeName.toLowerCase();
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
    const existingmake = await Make.findById(id);
    if (!existingmake) {
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }

    // Delete the make
    await Make.findByIdAndDelete(id);
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

export {
  createMake,
  getAllMakes,
  getMakeById,
  updateMake,
  deleteMake,
  validateMake,
};
