import VehicleNameModel from "../../models/vehicleName.js";

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

    const newvehicleName = new VehicleNameModel({
      vehicleName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
    });

    await newvehicleName.save();
    res.status(200).json({
      message: "New vehicle type created successfully",
      data: { newvehicleName },
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
const getAllvehicleNames = async (req, res) => {
  try {
    const VehicleNames = await VehicleNameModel.find();
    res.status(200).json({
      message: "Success! Here are all vehicle types",
      data: { VehicleNames },
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
const getvehicleNameByName = async (req, res) => {
  try {
    const { VehicleName } = req.params;
    const vehicleName = await VehicleNameModel.findOne({ VehicleName });
    if (!vehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res
      .status(200)
      .json({
        message: "Success! Here are all vehicle Names",
        data: { vehicleName },
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
const getvehicleNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const existingvehicleName = await VehicleNameModel.findById(id);
    if (!existingvehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }
    res.status(200).json({
      message: "Success! Here is the vehicle type with ID",
      data: { existingvehicleName },
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
const updatevehicleName = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    // Check if vehicle type exists
    const existingvehicleName = await VehicleNameModel.findById(id);
    if (!existingvehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle name not found" });
    }

    // Update the vehicle type
    const updatedvehicleName = await VehicleNameModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedBy, updatedOn: new Date() } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: `Vehicle type ${id} updated successfully`,
      data: { updatedvehicleName },
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
const deletevehicleName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle type exists
    const existingvehicleName = await VehicleNameModel.findById(id);
    if (!existingvehicleName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Vehicle type not found" });
    }

    // Delete the vehicle type
    await VehicleNameModel.findByIdAndDelete(id);
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
  getAllvehicleNames,
  getvehicleNameByName,
  getvehicleNameById,
  updatevehicleName,
  deletevehicleName,
};
