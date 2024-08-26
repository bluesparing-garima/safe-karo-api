import mongoose from "mongoose";
import Model from "../../models/adminModels/modelSchema.js";
import Make from "../../models/adminModels/modelSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

// Endpoint to create a new model with transaction
export const createModel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { modelName, makeId, makeName, createdBy, isActive } = req.body;

    const modelExists = await Model.exists({ modelName }).session(session);
    if (modelExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        status: "failed",
        message: "Model with the same modelName already exists",
      });
    }

    const newModel = new Model({
      makeId,
      makeName,
      modelName,
      createdBy,
      updatedBy: null,
      updatedOn: null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newModel.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "New Model created successfully",
      data: newModel,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating model:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "failed",
      message: "Unable to create model",
      error: error.message,
    });
  }
};

// Get all models
export const getAllModels = async (req, res) => {
  try {
    // Fetch and sort makes alphabetically by name
    const Models = await Model.find().sort({ makeName: 1 });

    res.status(200).json({
      message: "Success! Here are all models",
      data: Models,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve model" });
  }
};

// Check Model exist or not.
export const validateModel = async (req, res) => {
  try {
    const { model } = req.params;
    const normalizedModel = model.toLowerCase();

    const modelExists = await Model.findOne({
      modelName: { $regex: new RegExp(`^${normalizedModel}$`, "i") },
    });
    if (modelExists) {
      return res.status(200).json({
        message: "Model already exists",
        exist: true,
        status: "error",
      });
    } else {
      return res.status(200).json({
        message: "Model does not exist",
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking Model",
      error: error.message,
    });
  }
};

// Get model by ID
export const getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Make ID",
        status: "error",
      });
    }
    // Check if model exists
    const existingmodel = await Model.findById(id);
    if (!existingmodel) {
      return res
        .status(404)
        .json({ status: "failed", message: "Model name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the model with ID",
      data: existingmodel,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve model" });
  }
};

// Endpoint to update an existing model with transaction
export const updateModel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { makeId, modelName, updatedBy, isActive } = req.body;

    const existingModel = await Model.findById(id).session(session);
    if (!existingModel) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "failed",
        message: "Model name not found",
      });
    }

    const previousModelName = existingModel.modelName;
    const previousMakeName = existingModel.makeName;

    let makeName;

    if (req.body.makeName) {
      makeName = req.body.makeName;
    } else {
      const make = await Make.findById(makeId).session(session);
      if (!make) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: "failed",
          message: "Make name not found",
        });
      }
      makeName = make.makeName;
    }

    existingModel.makeId = makeId;
    existingModel.makeName = makeName;
    existingModel.modelName = modelName;
    existingModel.updatedBy = updatedBy;
    existingModel.updatedOn = new Date();
    if (isActive !== undefined) {
      existingModel.isActive = isActive;
    }

    const updatedModel = await existingModel.save({ session });

    const motorPoliciesWithModel = await MotorPolicyModel.find({
      model: previousModelName,
      make: previousMakeName,
    }).session(session);

    for (let motorPolicy of motorPoliciesWithModel) {
      motorPolicy.model = modelName;
      motorPolicy.make = makeName;
      await motorPolicy.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Model name ${id} updated successfully and referenced motor policies updated`,
      data: updatedModel,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating model:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "failed",
      message: "Unable to update model",
    });
  }
};

// Delete model
export const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if model exists
    const existingmodel = await Model.findById(id);
    if (!existingmodel) {
      return res
        .status(404)
        .json({ status: "failed", message: "Model name not found" });
    }

    // Delete the model
    await Model.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Model name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete model" });
  }
};
