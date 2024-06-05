// controllers/motorPolicyController.js
import MotorPolicyModel from "../models/motorPolicy.js";
import { v4 as uuidv4 } from "uuid";

const createMotorPolicy = async (req, res) => {
  console.log("REQUEST BODY", req.body);
  console.log("REQUEST FILE", req.files);
  try {
    const {
      policyCategory,
      policyType,
      caseType,
      product,
      insuranceCompany,
      broker,
      make,
      model,
      fuelType,
      RTO,
      seatCapacity,
      cc,
      registerDate,
      ncb,
      vehicleNumber,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      issueDate,
      endDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      madeBy,
    } = req.body;

    const files = req.files;
    const filePaths = {};

    if (files) {
      for (const key in files) {
        if (files.hasOwnProperty(key)) {
          filePaths[key] = files[key][0].path;
        }
      }
    }

    const newMotorPolicy = new MotorPolicyModel({
      uuid: uuidv4(),
      policyCategory,
      policyType,
      caseType,
      product,
      insuranceCompany,
      broker,
      make,
      model,
      fuelType,
      RTO,
      seatCapacity,
      cc,
      registerDate,
      ncb,
      vehicleNumber,
      policyNumber,
      fullName,
      emailId,
      phoneNumber,
      mfgYear,
      tenure,
      issueDate,
      endDate,
      idv,
      od,
      tp,
      netPremium,
      finalPremium,
      paymentMode,
      madeBy,
      ...filePaths,
    });

    await newMotorPolicy.save();

    res.status(201).json({
      status: "success",
      data: newMotorPolicy,
      message: "Motor policy created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to create motor policy",
      error: error.message,
    });
  }
};

export { createMotorPolicy };
