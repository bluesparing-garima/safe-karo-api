import Model from "../../models/adminModels/modelSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

// Create a new model
const createModel = async (req, res) => {
  try {
    const { makeId, makeName, modelName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!makeId || !makeName || !modelName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newmodel = new Model({
      makeId,
      makeName,
      modelName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newmodel.save();
    res.status(200).json({
      message: "New model created successfully",
      data: newmodel,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating model:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new model",
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
export const validateModel = async (req, res) => {
  try {
    const { model } = req.params;
    const modelExists = await MotorPolicyModel.exists({
      model,
    });
    if (modelExists) {
      return res.status(200).json({
        message: `model already exists`,
        exist: true,
        status: "success",
      });
    } else {
      return res.status(200).json({
        message: `model does not exist`,
        exist: false,
        status: "success",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking model",
      error: error.message,
    });
  }
};

// Get model by ID
const getModelById = async (req, res) => {
  try {
    const { id } = req.params;

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

export { createModel, getAllModels, getModelById, updateModel, deleteModel };
