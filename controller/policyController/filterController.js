import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";

// Get Policies by Date Range
export const getPoliciesByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        success: false,
        message: "Start date and end date are required.",
      });
    }
  
    try {
      const policies = await MotorPolicyModel.find({
        createdOn: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });
  
      if (policies.length === 0) {
        return res.status(404).json({
          message: "No policies found within the specified date range.",
          success: false,
          status: "error",
        });
      }
  
      const policyIds = policies.map(policy => policy._id);
      const payments = await MotorPolicyPaymentModel.find({
        policyId: { $in: policyIds },
      });
  
      const policyData = policies.map(policy => {
        const payment = payments.find(payment => payment.policyId.toString() === policy._id.toString());
        return {
          policy,
          payment,
        };
      });
  
      res.status(200).json({
        message: "Policies retrieved successfully.",
        data: policyData,
        success: true,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving policies.",
        success: false,
        error: error.message,
      });
    }
  };

export const getAllMatchingRecords = async (req, res) => {
  try {
    const {
      rto,
      policyType,
      caseType,
      productType,
      companyName,
      make,
      model,
      fuelType,
      cc,
      weight,
      ncb,
      vehicleAge,
    } = req.query;

    const missingFields = [];
    if (!rto) missingFields.push("rto");
    if (!policyType) missingFields.push("policyType");
    if (!caseType) missingFields.push("caseType");
    if (!productType) missingFields.push("productType");
    if (!companyName) missingFields.push("companyName");
    if (!make) missingFields.push("make");
    if (!model) missingFields.push("model");
    if (!fuelType) missingFields.push("fuelType");
    if (!cc) missingFields.push("cc");
    if (!weight) missingFields.push("weight");
    if (!ncb) missingFields.push("ncb");
    if (!vehicleAge) missingFields.push("vehicleAge");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required query parameters",
        missingFields,
        status: "Failed",
      });
    }

    const dbQuery = {
      fuelType: fuelType,
      productType: productType,
      cc: cc,
      weight: weight,
      ncb: ncb,
      policyType: policyType,
      rto: rto,
      caseType: caseType,
      companyName: companyName,
      make: make,
      model: model,
      vehicleAge: vehicleAge,
    };

    Object.keys(dbQuery).forEach((key) => {
      if (dbQuery[key] === undefined || dbQuery[key] === null) {
        delete dbQuery[key];
      }
    });

    const matchedRecords = await MotorPolicyModel.find(dbQuery);

    if (matchedRecords.length === 0) {
      return res.status(200).json({
        message: "No matching records found in the database",
        data: [],
        status: "Success",
      });
    }

    res.status(200).json({
      message: "Records found",
      data: matchedRecords,
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching data",
      error: error.message,
    });
  }
};