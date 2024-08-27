import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import PayInExcelDataModel from "../../models/adminModels/payInExcelDataSchema.js";
import PayOutExcelDataModel from "../../models/adminModels/payOutExcelDataSchema.js";

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
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const policies = await MotorPolicyModel.find({
      issueDate: {
        $gte: startDateObj,
        $lte: endDateObj,
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
        brokerId:policy.brokerId,
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
        issueDate: policy.issueDate,
        paymentId: payment ? payment._id : null,
        payInODPercentage: payment ? payment.payInODPercentage : 0,
        payInTPPercentage: payment ? payment.payInTPPercentage : 0,
        payInODAmount: payment ? payment.payInODAmount : 0,
        payInTPAmount: payment ? payment.payInTPAmount : 0,
        payOutODPercentage: payment ? payment.payOutODPercentage : 0,
        payOutTPPercentage: payment ? payment.payOutTPPercentage : 0,
        payOutODAmount: payment ? payment.payOutODAmount : 0,
        payOutTPAmount: payment ? payment.payOutTPAmount : 0,
        payInCommission: payment ? payment.payInCommission : 0,
        payOutCommission: payment ? payment.payOutCommission : 0,
        payInAmount: payment ? payment.payInAmount : 0,
        payOutAmount: payment ? payment.payOutAmount : 0,
        payInPaymentStatus: payment ? payment.payInPaymentStatus : "UnPaid",
        payOutPaymentStatus: payment ? payment.payOutPaymentStatus : "UnPaid",
        payInBalance: payment ? payment.payInBalance : 0,
        payOutBalance: payment ? payment.payOutBalance : 0,
        paymentCreatedBy: payment ? payment.createdBy : 0,
        paymentCreatedOn: payment ? payment.createdOn : 0,
        paymentUpdatedBy: payment ? payment.updatedBy : 0,
        paymentUpdatedOn: payment ? payment.updatedOn : 0,
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

    const dbQuery = [];
    if (rto) dbQuery.push({ rto });
    if (policyType) dbQuery.push({ policyType });
    if (caseType) dbQuery.push({ caseType });
    if (productType) dbQuery.push({ productType });
    if (companyName) dbQuery.push({ companyName });
    if (make) dbQuery.push({ make });
    if (model) dbQuery.push({ model });
    if (fuelType) dbQuery.push({ fuelType });
    if (cc) dbQuery.push({ cc });
    if (ncb) dbQuery.push({ ncb });
    if (vehicleAge) dbQuery.push({ vehicleAge });
    if (broker) dbQuery.push({ broker });

    if (dbQuery.length === 0) {
      return res.status(400).json({
        message: "At least one query parameter is required",
        status: "Failed",
      });
    }

    const matchedRecords = await MotorPolicyModel.find({ $or: dbQuery });
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
        brokerId:policy.brokerId,
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
        payInAmount: payment ? payment.payInAmount : 0,
        payOutAmount: payment ? payment.payOutAmount : 0,
        payInPaymentStatus: payment ? payment.payInPaymentStatus : "UnPaid",
        payOutPaymentStatus: payment ? payment.payOutPaymentStatus : "UnPaid",
        payInBalance: payment ? payment.payInBalance : 0,
        payOutBalance: payment ? payment.payOutBalance : 0,
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
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const updateFields = {};

    if (od !== undefined) {
      updateFields.od = parseFloat(od);
    }
    if (tp !== undefined) {
      updateFields.tp = parseFloat(tp);
    }

    const updatePaymentResult = await MotorPolicyPaymentModel.updateMany(
      { issueDate: { $gte: startDateObj, $lte: endDateObj } },
      { $set: updateFields }
    );

    const paymentPolicies = await MotorPolicyPaymentModel.find(
      { issueDate: { $gte: startDateObj, $lte: endDateObj } },
      { policyNumber: 1 }
    );

    const policyNumbers = paymentPolicies.map((policy) => policy.policyNumber);

    const updatePolicyResult = await MotorPolicyModel.updateMany(
      { policyNumber: { $in: policyNumbers } },
      { $set: updateFields }
    );

    res.status(200).json({
      message: "OD and TP updated successfully in both models.",
      success: true,
      status: "success",
      updatePaymentResult,
      updatePolicyResult,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating OD and TP.",
      success: false,
      error: error.message,
    });
  }
};

// update payIn and payOut commission
export const updateCommissionByDateRange = async (req, res) => {
  const {
    startDate,
    endDate,
    payInODPercentage,
    payInTPPercentage,
    payOutODPercentage,
    payOutTPPercentage,
  } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date and end date are required.",
    });
  }

  if (
    payInODPercentage === undefined &&
    payInTPPercentage === undefined &&
    payOutODPercentage === undefined &&
    payOutTPPercentage === undefined
  ) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "At least one of pay-in or pay-out percentages is required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const documentsToUpdate = await MotorPolicyPaymentModel.find({
      createdOn: { $gte: startDateObj, $lte: endDateObj },
    });

    if (documentsToUpdate.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "No documents found in the specified date range.",
      });
    }

    const updatedDocumentsWithCommission = await Promise.all(
      documentsToUpdate.map(async (doc) => {
        const { od, tp } = doc;

        let updatedFields = {};
        let payInCommission = 0;
        let payOutCommission = 0;

        if (
          payInODPercentage !== undefined &&
          payInTPPercentage !== undefined
        ) {
          const calculatedPayInODAmount = Math.round(
            (od * payInODPercentage) / 100
          );
          const calculatedPayInTPAmount = Math.round(
            (tp * payInTPPercentage) / 100
          );
          payInCommission = Math.round(
            calculatedPayInODAmount + calculatedPayInTPAmount
          );

          updatedFields = {
            ...updatedFields,
            payInODPercentage,
            payInTPPercentage,
            payInODAmount: calculatedPayInODAmount,
            payInTPAmount: calculatedPayInTPAmount,
            payInCommission,
          };
        }

        if (
          payOutODPercentage !== undefined &&
          payOutTPPercentage !== undefined
        ) {
          const calculatedPayOutODAmount = Math.round(
            (od * payOutODPercentage) / 100
          );
          const calculatedPayOutTPAmount = Math.round(
            (tp * payOutTPPercentage) / 100
          );
          payOutCommission = Math.round(
            calculatedPayOutODAmount + calculatedPayOutTPAmount
          );

          updatedFields = {
            ...updatedFields,
            payOutODPercentage,
            payOutTPPercentage,
            payOutODAmount: calculatedPayOutODAmount,
            payOutTPAmount: calculatedPayOutTPAmount,
            payOutCommission,
          };
        }

        const updatedDoc = await MotorPolicyPaymentModel.findByIdAndUpdate(
          doc._id,
          { $set: updatedFields },
          { new: true }
        );

        return updatedDoc;
      })
    );

    res.status(200).json({
      message: `Commission fields updated successfully.`,
      success: true,
      status: "success",
      updatedDocumentsWithCommission,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error updating commission fields.`,
      success: false,
      error: error.message,
    });
  }
};

// Get Policies by Date Range and Broker Name
export const getPoliciesByDateRangeAndBrokerName = async (req, res) => {
  const { startDate, endDate, broker } = req.query;

  if (!startDate || !endDate || !broker) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and broker name are required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const policies = await MotorPolicyModel.find({
      issueDate: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
      broker: broker,
    });

    if (policies.length === 0) {
      return res.status(404).json({
        message:
          "No policies found within the specified date range and broker name.",
        success: false,
        status: "error",
      });
    }

    const policyIds = policies.map((policy) => policy._id);
    const payments = await MotorPolicyModel.find({
      policyId: { $in: policyIds },
    });

    const policyData = await Promise.all(
      policies.map(async (policy) => {
        const payment = await MotorPolicyPaymentModel.findOne({
          policyId: policy._id,
        }).exec();

        return {
          policyId: policy._id,
          policyType: policy.policyType,
          caseType: policy.caseType,
          category: policy.category,
          subCategory: policy.subCategory,
          companyName: policy.companyName,
          broker: policy.broker,
          brokerId:policy.brokerId,
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
          issueDate: policy.issueDate,
          paymentId: payment ? payment._id : null,
          payInODPercentage: payment ? payment.payInODPercentage : 0,
          payInTPPercentage: payment ? payment.payInTPPercentage : 0,
          payInODAmount: payment ? payment.payInODAmount : 0,
          payInTPAmount: payment ? payment.payInTPAmount : 0,
          payOutODPercentage: payment ? payment.payOutODPercentage : 0,
          payOutTPPercentage: payment ? payment.payOutTPPercentage : 0,
          payOutODAmount: payment ? payment.payOutODAmount : 0,
          payOutTPAmount: payment ? payment.payOutTPAmount : 0,
          payInCommission: payment ? payment.payInCommission : 0,
          payOutCommission: payment ? payment.payOutCommission : 0,
          payInAmount: payment ? payment.payInAmount : 0,
          payOutAmount: payment ? payment.payOutAmount : 0,
          payInPaymentStatus: payment ? payment.payInPaymentStatus : "UnPaid",
          payOutPaymentStatus: payment ? payment.payOutPaymentStatus : "UnPaid",
          payInBalance: payment ? payment.payInBalance : 0,
          payOutBalance: payment ? payment.payOutBalance : 0,
          paymentCreatedBy: payment ? payment.createdBy : 0,
          paymentCreatedOn: payment ? payment.createdOn : 0,
          paymentUpdatedBy: payment ? payment.updatedBy : 0,
          paymentUpdatedOn: payment ? payment.updatedOn : 0,
        };
      })
    );
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

// Get Policies by Date Range and PartnerId
export const getPoliciesByDateRangeAndPartnerId = async (req, res) => {
  const { startDate, endDate, partnerId } = req.query;

  if (!startDate || !endDate || !partnerId) {
    return res.status(400).json({
      status: "error",
      success: false,
      message: "Start date, end date, and partnerId are required.",
    });
  }

  try {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    const policies = await MotorPolicyModel.find({
      issueDate: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
      partnerId: partnerId,
    });

    if (policies.length === 0) {
      return res.status(404).json({
        message:
          "No policies found within the specified date range and partnerId.",
        success: false,
        status: "error",
      });
    }

    const policyIds = policies.map((policy) => policy._id);
    const payments = await MotorPolicyModel.find({
      policyId: { $in: policyIds },
    });

    const policyData = await Promise.all(
      policies.map(async (policy) => {
        const payment = await MotorPolicyPaymentModel.findOne({
          policyId: policy._id,
        }).exec();

        return {
          policyId: policy._id,
          policyType: policy.policyType,
          caseType: policy.caseType,
          category: policy.category,
          subCategory: policy.subCategory,
          companyName: policy.companyName,
          broker: policy.broker,
          brokerId:policy.brokerId,
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
          policyDate: policy.issueDate,
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
          payInAmount: payment ? payment.payInAmount : 0,
          payOutAmount: payment ? payment.payOutAmount : 0,
          payInPaymentStatus: payment ? payment.payInPaymentStatus : "UnPaid",
          payOutPaymentStatus: payment ? payment.payOutPaymentStatus : "UnPaid",
          payInBalance: payment ? payment.payInBalance : 0,
          payOutBalance: payment ? payment.payOutBalance : 0,
          paymentCreatedBy: payment ? payment.createdBy : null,
          paymentCreatedOn: payment ? payment.createdOn : null,
          paymentUpdatedBy: payment ? payment.updatedBy : null,
          paymentUpdatedOn: payment ? payment.updatedOn : null,
        };
      })
    );

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