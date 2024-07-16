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

    const policyIds = policies.map((policy) => policy._id);
    const payments = await MotorPolicyPaymentModel.find({
      policyId: { $in: policyIds },
    });

    const policyData = policies.map((policy) => {
      const payment = payments.find(
        (payment) => payment.policyId.toString() === policy._id.toString()
      );
      return {
        policyType: policy.policyType,
        caseType: policy.caseType,
        category: policy.category,
        subCategory: policy.subCategory,
        companyName: policy.companyName,
        broker: policy.broker,
        vehicleAge: policy.vehicleAge,
        make: policy.make,
        model: policy.model,
        fuelType: policy.fuelType,
        rto: policy.rto,
        vehicleNumber: policy.vehicleNumber,
        weight: policy.weight,
        cc: policy.cc,
        ncb: policy.ncb,
        policyNumber: policy.policyNumber,
        fullName: policy.fullName,
        emailId: policy.emailId,
        phoneNumber: policy.phoneNumber,
        mfgYear: policy.mfgYear,
        tenure: policy.tenure,
        idv: policy.idv,
        od: policy.od,
        tp: policy.tp,
        netPremium: policy.netPremium,
        finalPremium: policy.finalPremium,
        paymentMode: policy.paymentMode,
        partnerId: policy.partnerId,
        partnerName: policy.partnerName,
        relationshipManagerId: policy.relationshipManagerId,
        relationshipManagerName: policy.relationshipManagerName,
        bookingId: policy.bookingId,
        policyCompletedBy: policy.policyCompletedBy,
        paymentDetails: policy.paymentDetails,
        productType: policy.productType,
        createdBy: policy.createdBy,
        updatedBy: policy.updatedBy,
        updatedOn: policy.updatedOn,
        isActive: policy.isActive,
        createdOn: policy.createdOn,
        paymentId: payment ? payment._id : null,
        payInODPercentage: payment ? payment.payInODPercentage : null,
        payInTPPercentage: payment ? payment.payInTPPercentage : null,
        payInODAmount: payment ? payment.payInODAmount : null,
        payInTPAmount: payment ? payment.payInTPAmount : null,
        payOutODPercentage: payment ? payment.payOutODPercentage : null,
        payOutTPPercentage: payment ? payment.payOutTPPercentage : null,
        payOutODAmount: payment ? payment.payOutODAmount : null,
        payOutTPAmount: payment ? payment.payOutTPAmount : null,
        payInCommission: payment ? payment.payInCommission : null,
        payOutCommission: payment ? payment.payOutCommission : null,
        paymentCreatedBy: payment ? payment.createdBy : null,
        paymentCreatedOn: payment ? payment.createdOn : null,
        paymentUpdatedBy: payment ? payment.updatedBy : null,
        paymentUpdatedOn: payment ? payment.updatedOn : null,
      };
    });

    res.status(200).json({
      message: "Motor Policy with Payment Details retrieved successfully.",
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

// Get Policy Details from MatchingRecords
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
      ncb,
      vehicleAge,
      broker,
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
    if (!ncb) missingFields.push("ncb");
    if (!vehicleAge) missingFields.push("vehicleAge");
    if (!broker) missingFields.push("broker");
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
      ncb: ncb,
      policyType: policyType,
      rto: rto,
      caseType: caseType,
      companyName: companyName,
      make: make,
      model: model,
      vehicleAge: vehicleAge,
      broker: broker,
    };

    Object.keys(dbQuery).forEach((key) => {
      if (dbQuery[key] === undefined || dbQuery[key] === null) {
        delete dbQuery[key];
      }
    });

    const matchedRecords = await MotorPolicyModel.find(dbQuery);
    const policyIds = matchedRecords.map((policy) => policy._id);
    const payments = await MotorPolicyPaymentModel.find({
      policyId: { $in: policyIds },
    });

    const policyData = matchedRecords.map((policy) => {
      const payment = payments.find(
        (payment) => payment.policyId.toString() === policy._id.toString()
      );
      return {
        policyType: policy.policyType,
        caseType: policy.caseType,
        category: policy.category,
        subCategory: policy.subCategory,
        companyName: policy.companyName,
        broker: policy.broker,
        vehicleAge: policy.vehicleAge,
        make: policy.make,
        model: policy.model,
        fuelType: policy.fuelType,
        rto: policy.rto,
        vehicleNumber: policy.vehicleNumber,
        weight: policy.weight,
        cc: policy.cc,
        ncb: policy.ncb,
        policyNumber: policy.policyNumber,
        fullName: policy.fullName,
        emailId: policy.emailId,
        phoneNumber: policy.phoneNumber,
        mfgYear: policy.mfgYear,
        tenure: policy.tenure,
        idv: policy.idv,
        od: policy.od,
        tp: policy.tp,
        netPremium: policy.netPremium,
        finalPremium: policy.finalPremium,
        paymentMode: policy.paymentMode,
        partnerId: policy.partnerId,
        partnerName: policy.partnerName,
        relationshipManagerId: policy.relationshipManagerId,
        relationshipManagerName: policy.relationshipManagerName,
        bookingId: policy.bookingId,
        policyCompletedBy: policy.policyCompletedBy,
        paymentDetails: policy.paymentDetails,
        productType: policy.productType,
        createdBy: policy.createdBy,
        updatedBy: policy.updatedBy,
        updatedOn: policy.updatedOn,
        isActive: policy.isActive,
        createdOn: policy.createdOn,
        paymentId: payment ? payment._id : null,
        payInODPercentage: payment ? payment.payInODPercentage : null,
        payInTPPercentage: payment ? payment.payInTPPercentage : null,
        payInODAmount: payment ? payment.payInODAmount : null,
        payInTPAmount: payment ? payment.payInTPAmount : null,
        payOutODPercentage: payment ? payment.payOutODPercentage : null,
        payOutTPPercentage: payment ? payment.payOutTPPercentage : null,
        payOutODAmount: payment ? payment.payOutODAmount : null,
        payOutTPAmount: payment ? payment.payOutTPAmount : null,
        payInCommission: payment ? payment.payInCommission : null,
        payOutCommission: payment ? payment.payOutCommission : null,
        paymentCreatedBy: payment ? payment.createdBy : null,
        paymentCreatedOn: payment ? payment.createdOn : null,
        paymentUpdatedBy: payment ? payment.updatedBy : null,
        paymentUpdatedOn: payment ? payment.updatedOn : null,
      };
    });

    res.status(200).json({
      message: "Records found",
      data: policyData,
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching data",
      error: error.message,
    });
  }
};

// Update OD and TP by Date Range
export const updateODTPByDateRange = async (req, res) => {
  const { startDate, endDate, od, tp } = req.body;

  if (!startDate || !endDate || (od === undefined && tp === undefined)) {
    return res.status(400).json({
      status: "error",
      success: false,
      message:
        "Start date, end date, and at least one of OD or TP are required.",
    });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const updateFields = {};

    if (od !== undefined) {
      updateFields.od = parseFloat(od);
    }
    if (tp !== undefined) {
      updateFields.tp = parseFloat(tp);
    }

    const updateResult = await MotorPolicyPaymentModel.updateMany(
      { createdOn: { $gte: start, $lte: end } },
      { $set: updateFields }
    );

    res.status(200).json({
      message: "OD and TP updated successfully.",
      success: true,
      status: "success",
      updateResult,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating OD and TP.",
      success: false,
      error: error.message,
    });
  }
};
