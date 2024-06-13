import VehicleTypeModel from "../../models/vehicleTypeSchema.js";

// Create a new vehicle type
const createVehicleType = async (req, res) => {
  try {
    const { vehicleId, vehicleType, createdBy } = req.body;

    // Check if all required fields are provided
    if (!vehicleType || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newVehicleType = new VehicleTypeModel({
      vehicleId: vehicleId || null, // Set vehicleId or default to null
      vehicleType,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
    });

    await newVehicleType.save();
    res.status(200).json({
      message: "New vehicle type created successfully",
      data:  newVehicleType ,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new vehicle type",
      error: error.message,
    });
  }
};

// Get all vehicle types
const getAllVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await VehicleTypeModel.find();
    res.status(200).json({
      message: "Success! Here are all vehicle types",
      data:  vehicleTypes ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve vehicle types" });
  }
};

// Get vehicle type by name
const getVehicleTypeByName = async (req, res) => {
  try {
    const { vehicleType } = req.params;
    const vehicleName = await VehicleTypeModel.findOne({ vehicleType });
    if (!vehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res
      .status(200)
      .json({
        message: "Success! Here is the vehicle type with ID",
        data: vehicleName ,
        status: "success",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve vehicle type" });
  }
};

// Get vehicle type by ID
const getVehicleTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const existingVehicleType = await VehicleTypeModel.findById(id);
    if (!existingVehicleType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res.status(200).json({
      status: "success",
      data: existingVehicleType ,
      message: "Success! Here is the vehicle type with ID",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve vehicle type" });
  }
};

// Update vehicle type
const updateVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if vehicle type exists
    const existingVehicleType = await VehicleTypeModel.findById(id);
    if (!existingVehicleType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }

    // Update the vehicle type
    const updatedVehicleType = await VehicleTypeModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data:  updatedVehicleType ,
      message: `Vehicle type ${id} updated successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update vehicle type",
    });
  }
};

// Delete vehicle type
const deleteVehicleType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const existingVehicleType = await VehicleTypeModel.findById(id);
    if (!existingVehicleType) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }

    // Delete the vehicle type
    await VehicleTypeModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({
        status: "success",
        message: "Vehicle type deleted successfully",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete vehicle type" });
  }
};

export {
  createVehicleType,
  getAllVehicleTypes,
  getVehicleTypeByName,
  getVehicleTypeById,
  updateVehicleType,
  deleteVehicleType,
};
