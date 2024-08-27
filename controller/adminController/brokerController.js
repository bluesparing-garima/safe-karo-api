import mongoose from 'mongoose';
import BrokerModel from "../../models/adminModels/brokerSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

// Create a new broker name with transaction
export const createBrokerName = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { brokerName, createdBy, isActive } = req.body;

    // Check if all required fields are provided
    if (!brokerName || !createdBy) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }

    // Convert brokerName to lowercase for uniqueness validation
    const lowerCaseBrokerName = brokerName.toLowerCase();

    // Check if brokerName already exists (case-insensitive)
    const existingBroker = await BrokerModel.findOne({
      brokerName: new RegExp(`^${lowerCaseBrokerName}$`, 'i')
    }).session(session);

    if (existingBroker) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: "failed", message: "Broker name already exists" });
    }

    const newBrokerName = new BrokerModel({
      brokerName,
      createdBy,
      updatedBy: null, // Set updatedBy to null initially
      updatedOn: null, // Set updatedOn to null initially
      isActive: isActive !== undefined ? isActive : true, // Set default value to true if not provided
    });

    await newBrokerName.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "New broker name created successfully",
      data: newBrokerName,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating broker name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create new broker name",
      error: error.message,
    });
  }
};

// Get all broker names
export const getAllBrokerNames = async (req, res) => {
  try {
    const brokerNames = await BrokerModel.find({ isActive: true }).sort({ brokerName: 1 });
    res.status(200).json({
      message: "Success! Here are all active broker names",
      data: brokerNames,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve broker names" });
  }
};

// Get broker name by ID
export const getBrokerNameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if broker name exists
    const existingBrokerName = await BrokerModel.findById(id);
    if (!existingBrokerName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }
    res.status(200).json({
      message: "Success! Here is the broker name with ID",
      data: existingBrokerName,
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to retrieve broker name" });
  }
};

// Update broker name with transaction
export const updateBrokerName = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { brokerName, updatedBy, isActive } = req.body;

    // Check if broker name exists
    const existingBrokerName = await BrokerModel.findById(id).session(session);
    if (!existingBrokerName) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }

    // Get the previous name of the broker
    const previousBrokerName = existingBrokerName.brokerName;

    // Convert new brokerName to lowercase for uniqueness validation
    const lowerCaseBrokerName = brokerName.toLowerCase();

    // Check if brokerName already exists (case-insensitive)
    const duplicateBroker = await BrokerModel.findOne({
      brokerName: new RegExp(`^${lowerCaseBrokerName}$`, 'i')
    }).session(session);

    if (duplicateBroker && duplicateBroker._id.toString() !== id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ status: "failed", message: "Broker name already exists" });
    }

    // Update the broker name
    existingBrokerName.brokerName = brokerName;
    existingBrokerName.updatedBy = updatedBy;
    existingBrokerName.updatedOn = new Date();
    if (isActive !== undefined) {
      existingBrokerName.isActive = isActive;
    }

    const updatedBrokerName = await existingBrokerName.save({ session });

    // Find all motor policies that reference the previous broker name
    const motorPoliciesWithBroker = await MotorPolicyModel.find({
      broker: previousBrokerName,
    }).session(session);

    // Update the broker reference in each motor policy if it's not already updated
    for (let motorPolicy of motorPoliciesWithBroker) {
      if (motorPolicy.broker !== brokerName) {
        motorPolicy.broker = brokerName;
        await motorPolicy.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Broker name ${id} updated successfully and referenced motor policies updated`,
      data: updatedBrokerName,
      status: "success",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating broker name:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update broker name",
    });
  }
};

// Delete broker name
export const deleteBrokerName = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if broker name exists
    const existingBrokerName = await BrokerModel.findById(id);
    if (!existingBrokerName) {
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
