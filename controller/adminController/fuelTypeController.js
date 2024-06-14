import FuelTypeModel from "../../models/fuelTypeSchema.js";

// Create a new fuel type
const createFuelType = async (req, res) => {
  try {
    const { fuelType, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!fuelType || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newfuelType = new FuelTypeModel({
      fuelType,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newfuelType.save();
    res.status(200).json({
      message: "New fuel type created successfully",
      data: newfuelType,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating fuel type:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new fuel type",
      error: error.message,
    });
  }
};

// Get all fuel types
const getAllFuelTypes = async (req, res) => {
  try {
    const FuelTypes = await FuelTypeModel.find();
    res.status(200).json({
      message: "Success! Here are all fuel types",
      data: FuelTypes,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve fuel type" });
  }
};

// Get fuel type by ID
const getFuelTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if fuel type exists
    const existingfuelType = await FuelTypeModel.findById(id);
    if (!existingfuelType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Fuel name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the fuel type with ID",
      data: existingfuelType,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve fuel type" });
  }
};

// Update fuelType
const updateFuelType = async (req, res) => {
  try {
    const { id } = req.params;
    const { fuelType, updatedBy, isActive } = req.body;

    // Check if fuel type exists
    const existingFuelType = await FuelTypeModel.findById(id);
    if (!existingFuelType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Fuel name not found" });
    }

    // Update the fuel type
    existingFuelType.fuelType = fuelType;
    existingFuelType.updatedBy = updatedBy;
    existingFuelType.updatedOn = new Date();
    if (isActive !== undefined) {
      existingFuelType.isActive = isActive;
    }

    const updatedFuelType = await existingFuelType.save();

    res.status(200).json({
      message: `Fuel name ${id} updated successfully`,
      data: updatedFuelType,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating fuel type:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update fuel type",
    });
  }
};

// Delete fuelType
const deleteFuelType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if fuel type exists
    const existingfuelType = await FuelTypeModel.findById(id);
    if (!existingfuelType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Fuel name not found" });
    }

    // Delete the fuel type
    await FuelTypeModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Fuel name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete fuel type" });
  }
};

export {
  createFuelType,
  getAllFuelTypes,
  getFuelTypeById,
  updateFuelType,
  deleteFuelType,
};
