import mongoose from "mongoose";
import Make from "../../models/adminModels/makeSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import Model from "../../models/adminModels/modelSchema.js";

// Create a new make with transaction
export const createMake = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { makeName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!makeName || !createdBy) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const existingMake = await Make.findOne({
      makeName,
    }).session(session);

    if (existingMake) {
      await session.abortTransaction();
      session.endSession();
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

    await newMake.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "New make created successfully",
      data: newMake,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating make:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new make",
      error: error.message,
    });
  }
};

// Get all makes
export const getAllMakes = async (req, res) => {
  try {
    //const makes = await Make.find();
    // Fetch and sort makes alphabetically by makeName
    const makes = await Make.find().sort({ makeName: 1 });
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
export const validateMake = async (req, res) => {
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
export const getMakeById = async (req, res) => {
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

// Update make with transaction
export const updateMake = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { makeName, updatedBy, isActive } = req.body;

    // Check if make exists
    const existingMake = await Make.findById(id).session(session);
    if (!existingMake) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ status: "failed", message: "Make name not found" });
    }

    // Get the previous name of make
    const previousMakeName = existingMake.makeName;

    // Update the make
    existingMake.makeName = makeName;
    existingMake.updatedBy = updatedBy;
    existingMake.updatedOn = new Date();
    if (isActive !== undefined) {
      existingMake.isActive = isActive;
    }

    const updatedMake = await existingMake.save({ session });

    // Find all motor policies that reference the previous make
    const motorPoliciesWithMake = await MotorPolicyModel.find({
      make: previousMakeName,
    }).session(session);

    // Update the make reference in each motor policy
    for (let motorPolicy of motorPoliciesWithMake) {
      motorPolicy.make = makeName;
      await motorPolicy.save({ session });
    }

    // Find all models that reference the previous make
    const modelsWithMake = await Model.find({
      makeName: previousMakeName,
    }).session(session);

    // Update the make reference in each model
    for (let model of modelsWithMake) {
      model.makeName = makeName;
      await model.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Make name ${id} updated successfully and referenced motor policies and models updated`,
      data: updatedMake,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating make:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update make",
    });
  }
};

// Delete make
export const deleteMake = async (req, res) => {
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

