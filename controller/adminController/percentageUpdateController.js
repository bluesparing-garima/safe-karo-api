import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import PayInExcelDataModel from "../../models/adminModels/payInExcelDataSchema.js";
import PayOutExcelDataModel from "../../models/adminModels/payOutExcelDataSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

// create a Entry in PayInExcelModel if payIn OD and TP same for PayOut
export const createPercentageData = async (req, res) => {
  try {
    const {
      policyType,
      caseType,
      productType,
      subCategory,
      companyName,
      broker,
      make,
      model,
      fuelType,
      ncb,
      vehicleAge,
      seatingCapacity,
      rto,
      cc,
      payInODPercentage,
      payInTPPercentage,
      payOutODPercentage,
      payOutTPPercentage,
      startDate,
      endDate,
    } = req.body;

    if (
      !policyType ||
      !caseType ||
      !productType ||
      !subCategory ||
      !companyName ||
      !broker ||
      !make ||
      !model ||
      !fuelType ||
      !ncb ||
      !vehicleAge ||
      !seatingCapacity ||
      !rto ||
      !cc ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    const query = {
      policyType,
      caseType,
      productType,
      subCategory,
      companyName,
      broker,
      make,
      model,
      fuelType,
      ncb,
      vehicleAge,
      seatingCapacity,
      rto,
      cc,
      startDate: start,
      endDate: end,
    };

    const createOrUpdateRecord = async (Model, data) => {
      try {
        const existingRecord = await Model.findOne(query);

        if (existingRecord) {
          existingRecord.od = data.od;
          existingRecord.tp = data.tp;
          existingRecord.updatedBy = "admin";
          existingRecord.updatedOn = new Date();
          await existingRecord.save();
        } else {
          await Model.create({
            ...query,
            od: data.od,
            tp: data.tp,
            createdBy: "admin",
            createdOn: new Date(),
            updatedBy: null,
            updatedOn: null,
          });
        }
      } catch (err) {
        console.error(
          `Error creating or updating record in ${Model.collection.name}:`,
          err
        );
        throw err; // Re-throw to catch in outer try-catch
      }
    };

    if (payInODPercentage !== undefined && payInTPPercentage !== undefined) {
      await createOrUpdateRecord(PayInExcelDataModel, {
        od: payInODPercentage,
        tp: payInTPPercentage,
      });
    }

    if (payOutODPercentage !== undefined && payOutTPPercentage !== undefined) {
      await createOrUpdateRecord(PayOutExcelDataModel, {
        od: payOutODPercentage,
        tp: payOutTPPercentage,
      });
    }

    res.status(200).json({
      message: "Data added or updated successfully in the relevant models",
      status: "Success",
    });
  } catch (error) {
    console.error(`Error in createPercentageData:`, error);
    res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

export const updateCommissionByInputs = async (req, res) => {
  const {
    policyType,
    caseType,
    productType,
    subCategory,
    companyName,
    broker,
    make,
    model,
    fuelType,
    ncb,
    vehicleAge,
    seatingCapacity,
    rto,
    cc,
    payInODPercentage,
    payInTPPercentage,
    payOutODPercentage,
    payOutTPPercentage,
    startDate,
    endDate,
  } = req.body;

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

    const motorPolicyQuery = {
      policyType,
      caseType,
      productType,
      subCategory,
      companyName,
      broker,
      make,
      model,
      fuelType,
      ncb,
      vehicleAge,
      seatingCapacity,
      rto,
      cc,
      issueDate: { $gte: startDateObj, $lte: endDateObj },
    };

    const matchingPolicies = await MotorPolicyModel.find(motorPolicyQuery);

    if (matchingPolicies.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "No matching policies found.",
      });
    }

    const policyNumbers = matchingPolicies.map((policy) => policy.policyNumber);

    const motorPolicyPaymentQuery = {
      policyNumber: { $in: policyNumbers },
    };

    const motorPolicyPayments = await MotorPolicyPaymentModel.find(
      motorPolicyPaymentQuery
    );

    if (motorPolicyPayments.length === 0) {
      return res.status(404).json({
        status: "error",
        success: false,
        message: "No matching policy payments found.",
      });
    }

    const updatedPayments = await Promise.all(
      motorPolicyPayments.map(async (payment) => {
        const { od, tp } = payment;

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

          await PayInExcelDataModel.create({
            policyNumber: payment.policyNumber,
            ...motorPolicyQuery,
            od: payInODPercentage,
            tp: payInTPPercentage,
            createdBy: "admin",
            createdOn: new Date(),
          });
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

          await PayOutExcelDataModel.create({
            policyNumber: payment.policyNumber,
            ...motorPolicyQuery,
            od: payOutODPercentage,
            tp: payOutTPPercentage,
            createdBy: "admin",
            createdOn: new Date(),
          });
        }

        const updatedPayment = await MotorPolicyPaymentModel.findOneAndUpdate(
          { policyNumber: payment.policyNumber },
          { $set: updatedFields },
          { new: true }
        );

        return updatedPayment;
      })
    );

    res.status(200).json({
      message: `Commission fields updated successfully.`,
      success: true,
      status: "success",
      updatedPayments,
    });
  } catch (error) {
    console.error(`Error updating motor policy:`, error);
    res.status(500).json({
      message: `Error updating commission fields.`,
      success: false,
      error: error.message,
    });
  }
};