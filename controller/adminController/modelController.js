import Model from "../../models/adminModels/modelSchema.js";
import mongoose from "mongoose";
// Endpoint to check if a model exists
const createModel = async (req, res) => {
  try {
    const { modelName,makeId,makeName,createdBy,isActive } = req.body;

    const modelExists = await Model.exists({
      modelName,
    });
    if (modelExists) {
      return res.status(409).json({
        status: "failed",
        message: "Make with the same makeName already exists",
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
    await newModel.save();
    res.status(200).json({
      message: "New Model created successfully",
      data: newModel,
      status: "success",
    });
  } catch (error) {
    console.error("Error checking model existence:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to check model existence",
      error: error.message,
    });
  }
};

// Get all models
const getAllModels = async (req, res) => {
  try {
    const Models = await Model.find();
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
const validateModel = async (req, res) => {
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
const getModelById = async (req, res) => {
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

// Update model
const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { makeId, makeName, modelName, updatedBy, isActive } = req.body;

    // Check if model exists
    const existingModel = await Model.findById(id);
    if (!existingModel) {
      return res
        .status(404)
        .json({ status: "failed", message: "Model name not found" });
    }

    // Update the model
    existingModel.makeId = makeId;
    existingModel.makeName = makeName;
    existingModel.modelName = modelName;
    existingModel.updatedBy = updatedBy;
    existingModel.updatedOn = new Date();
    if (isActive !== undefined) {
      existingModel.isActive = isActive;
    }

    const updatedModel = await existingModel.save();

    res.status(200).json({
      message: `Model name ${id} updated successfully`,
      data: updatedModel,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating model:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update model",
    });
  }
};

// Delete model
const deleteModel = async (req, res) => {
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

export {
  createModel,
  getAllModels,
  getModelById,
  updateModel,
  deleteModel,
  validateModel,
};
