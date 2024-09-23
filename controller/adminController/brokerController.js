import BrokerModel from "../../models/adminModels/brokerSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

// Create a new broker name
export const createBrokerName = async (req, res) => {
  try {
    const { brokerName, createdBy, isActive } = req.body;

    if (!brokerName || !createdBy) {
      return res
        .status(400)
        .json({ status: "failed", message: "Required fields are missing" });
    }
    const lowerCaseBrokerName = brokerName.toLowerCase();

    const existingBroker = await BrokerModel.findOne({
      brokerName: new RegExp(`^${lowerCaseBrokerName}$`, 'i')
    });

    if (existingBroker) {
      return res
        .status(400)
        .json({ status: "failed", message: "Broker name already exists" });
    }

    const lastBroker = await BrokerModel.findOne().sort({ createdOn: -1 }).exec();
    
    let newBrokerCode = "BR001"; 
    if (lastBroker && lastBroker.brokerCode) {
      const lastBrokerCode = lastBroker.brokerCode;
      const lastBrokerNumber = parseInt(lastBrokerCode.slice(2), 10); 
      const newBrokerNumber = (lastBrokerNumber + 1).toString().padStart(3, '0');
      newBrokerCode = `BR${newBrokerNumber}`;
    }

    const newBrokerName = new BrokerModel({
      brokerName,
      brokerCode: newBrokerCode,
      createdBy,
      updatedBy: null,
      updatedOn: null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newBrokerName.save();
    res.status(200).json({
      message: "New broker name created successfully",
      data: newBrokerName,
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

// Update broker name
export const updateBrokerName = async (req, res) => {
  try {
    const { id } = req.params;
    const { brokerName, updatedBy, isActive } = req.body;

    const existingBrokerName = await BrokerModel.findById(id);
    if (!existingBrokerName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }

    const previousBrokerName = existingBrokerName.brokerName;

    const lowerCaseBrokerName = brokerName.toLowerCase();

    const duplicateBroker = await BrokerModel.findOne({
      brokerName: new RegExp(`^${lowerCaseBrokerName}$`, 'i')
    });

    if (duplicateBroker && duplicateBroker._id.toString() !== id) {
      return res
        .status(400)
        .json({ status: "failed", message: "Broker name already exists" });
    }

    existingBrokerName.brokerName = brokerName;
    existingBrokerName.updatedBy = updatedBy;
    existingBrokerName.updatedOn = new Date();
    if (isActive !== undefined) {
      existingBrokerName.isActive = isActive;
    }

    const updatedBrokerName = await existingBrokerName.save();

    const motorPoliciesWithBroker = await MotorPolicyModel.find({
      broker: previousBrokerName,
    });

    for (let motorPolicy of motorPoliciesWithBroker) {
      if (motorPolicy.broker !== brokerName) {
        motorPolicy.broker = brokerName;
        await motorPolicy.save();
      }
    }

    res.status(200).json({
      message: `Broker name ${id} updated successfully and referenced motor policies updated`,
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

// Delete broker name
export const deleteBrokerName = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBrokerName = await BrokerModel.findById(id);
    if (!existingBrokerName) {
      return res
        .status(404)
        .json({ status: "failed", message: "Broker name not found" });
    }

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
