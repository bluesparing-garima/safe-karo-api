import VehicleModel from "../../models/vehicleSchema.js";

// Create a new vehicle type
const createVehicleName = async (req, res) => {
  try {
    const { vehicleName, createdBy } = req.body;

    // Check if all required fields are provided
    if (!vehicleName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newvehicleName = new VehicleModel({
      vehicleName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
    });

    await newvehicleName.save();
    res.status(200).json({
      message: "New vehicle type created successfully",
      data: newvehicleName ,
      status: "success",
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
    const VehicleNames = await VehicleModel.find();
    res.status(200).json({
      message: "Success! Here are all vehicle types",
      data:  VehicleNames ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve vehicle name" });
  }
};

// Get vehicle type by name
const getVehicleNameByName = async (req, res) => {
  try {
    const { VehicleName } = req.params;
    const vehicleName = await VehicleModel.findOne({ VehicleName });
    if (!vehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res
      .status(200)
      .json({
        message: "Success! Here are all vehicle Names",
        data:  vehicleName ,
        status: "success",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve vehicle name" });
  }
};

// Get vehicle type by ID
const getVehicleNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const existingvehicleName = await VehicleModel.findById(id);
    if (!existingvehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res.status(200).json({
      message: "Success! Here is the vehicle type with ID",
      data: existingvehicleName ,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve vehicle name" });
  }
};

// Update vehicle type
const updateVehicleName = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if vehicle type exists
    const existingvehicleName = await VehicleModel.findById(id);
    if (!existingvehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle name not found" });
    }

    // Update the vehicle type
    const updatedvehicleName = await VehicleModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: `Vehicle type ${id} updated successfully`,
      data:  updatedvehicleName ,
      status: "success",
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
    const existingvehicleName = await VehicleModel.findById(id);
    if (!existingvehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }

    // Delete the vehicle type
    await VehicleModel.findByIdAndDelete(id);
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
  createVehicleName,
  getAllVehicleNames,
  getVehicleNameByName,
  getVehicleNameById,
  updateVehicleName,
  deleteVehicleName,
};
