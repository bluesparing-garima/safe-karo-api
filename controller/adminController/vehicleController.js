import VehicleModel from "../../models/vehicleSchema.js";

// Create a new vehicle type
const createVehicleName = async (req, res) => {
  try {
    const { vehicleName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!vehicleName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newVehicle = new VehicleModel({
      vehicleName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set isActive to true if not provided
    });

    await newVehicle.save();
    res.status(200).json({
      status: "success",
      data: newVehicle,
      message: "New vehicle type created successfully",
    });
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new vehicle name",
      error: error.message,
    });
  }
};

// Get all vehicle types
const getAllVehicleNames = async (req, res) => {
  try {
    const vehicleNames = await VehicleModel.find({ isActive: true });
    res.status(200).json({
      status: "success",
      data: vehicleNames,
      message: "Success! Here are all vehicle types",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve vehicle name",
    });
  }
};

// Get vehicle type by name
const getVehicleNameByName = async (req, res) => {
  try {
    const { vehicleName } = req.params;
    const vehicle = await VehicleModel.findOne({ vehicleName, isActive: true });
    if (!vehicle) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res.status(200).json({
      status: "success",
      data: vehicle,
      message: "Success! Here are all vehicle Names",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve vehicle name",
    });
  }
};

// Get vehicle type by ID
const getVehicleNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const vehicle = await VehicleModel.findById(id);
    if (!vehicle || !vehicle.isActive) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res.status(200).json({
      status: "success",
      data: vehicle,
      message: "Success! Here is the vehicle type with ID",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to retrieve vehicle name",
    });
  }
};

// Update vehicle type
const updateVehicleName = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, isActive, ...updateData } = req.body;

    // Check if vehicle type exists
    const existingVehicle = await VehicleModel.findById(id);
    if (!existingVehicle) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle name not found" });
    }

    // Update the vehicle type
    existingVehicle.set({
      ...updateData,
      updatedBy,
      updatedOn: new Date(),
      isActive: isActive !== undefined ? isActive : existingVehicle.isActive,
    });
    const updatedVehicle = await existingVehicle.save();

    res.status(200).json({
      status: "success",
      data: updatedVehicle,
      message: `Vehicle type ${id} updated successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update vehicle name",
    });
  }
};

// Delete vehicle type
const deleteVehicleName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const existingVehicle = await VehicleModel.findById(id);
    if (!existingVehicle) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }

    // Delete the vehicle type (soft delete by setting isActive to false)
    existingVehicle.isActive = false;
    await existingVehicle.save();

    res.status(200).json({
      status: "success",
      message: "Vehicle type deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to delete vehicle type",
    });
  }
};

export {
  createVehicleName,
  getAllVehicleNames,
  getVehicleNameByName,
  getVehicleNameById,
  updateVehicleName,
  deleteVehicleName,
};
