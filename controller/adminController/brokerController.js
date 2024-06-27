import BrokerModel from "../../models/adminModels/brokerSchema.js";

// Create a new broker name
const createBrokerName = async (req, res) => {
  try {
    const { brokerName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!brokerName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    const newbrokerName = new BrokerModel({
      brokerName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newbrokerName.save();
    res.status(200).json({
      message: "New broker name created successfully",
      data: newbrokerName,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating broker name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new broker name",
      error: error.message,
    });
  }
};

// Get all broker names
const getAllBrokerNames = async (req, res) => {
  try {
    const BrokerNames = await BrokerModel.find();
    res.status(200).json({
      message: "Success! Here are all broker names",
      data: BrokerNames,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve broker name" });
  }
};

// Get broker name by ID
const getBrokerNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if broker name exists
    const existingbrokerName = await BrokerModel.findById(id);
    if (!existingbrokerName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the broker name with ID",
      data: existingbrokerName,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve broker name" });
  }
};

// Update brokerName
const updateBrokerName = async (req, res) => {
  try {
    const { id } = req.params;
    const { brokerName, updatedBy, isActive } = req.body;

    // Check if broker name exists
    const existingBrokerName = await BrokerModel.findById(id);
    if (!existingBrokerName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }

    // Update the broker name
    existingBrokerName.brokerName = brokerName;
    existingBrokerName.updatedBy = updatedBy;
    existingBrokerName.updatedOn = new Date();
    if (isActive !== undefined) {
      existingBrokerName.isActive = isActive;
    }

    const updatedBrokerName = await existingBrokerName.save();

    res.status(200).json({
      message: `Broker name ${id} updated successfully`,
      data: updatedBrokerName,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating broker name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update broker name",
    });
  }
};

// Delete brokerName
const deleteBrokerName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if broker name exists
    const existingbrokerName = await BrokerModel.findById(id);
    if (!existingbrokerName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }

    // Delete the broker name
    await BrokerModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Broker name deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete broker name" });
  }
};

export {
  createBrokerName,
  getAllBrokerNames,
  getBrokerNameById,
  updateBrokerName,
  deleteBrokerName,
};
