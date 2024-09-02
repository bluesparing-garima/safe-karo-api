import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PayOutExcelDataModel from "../../models/adminModels/payOutExcelDataSchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";
import MotorPolicyModel from "../../models/policyModel/motorpolicySchema.js";

const dataFilePath = path.join(process.cwd(), "data", "data.json");
const hashFilePath = path.join(process.cwd(), "data", "hashes.json");

if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

const computeHash = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

const formatDateString = (dateValue) => {
  if (typeof dateValue === "number") {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return new Date(date.y, date.m - 1, date.d).toISOString().split("T")[0];
  }

  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return "";
};

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.file;
    const fileHash = computeHash(file.buffer);

    let storedHashes = [];
    if (fs.existsSync(hashFilePath)) {
      const rawHashData = fs.readFileSync(hashFilePath);
      storedHashes = JSON.parse(rawHashData);
    }

    if (storedHashes.includes(fileHash)) {
      return res.status(400).json({ message: "File has already been uploaded." });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

    const extractedData = worksheet.map((row) => ({
      policyType: row.policyType || row["Policy Type"] || "",
      caseType: row.caseType || row["Case Type"] || "",
      productType: row.productType || row["Product Type"] || "",
      subCategory: row.subCategory || row["SubCategory"] || "",
      fuelType: row.fuelType || row["Fuel Type"] || "",
      weight: row.weight || row["Weight"] || 0,
      ncb: row.ncb || row["NCB"] || "",
      rto: row.rto || row["RTO"] || "",
      companyName: row.companyName || row["Company Name"] || "",
      make: row.make || row["Make"] || "",
      model: row.model || row["Model"] || "",
      vehicleAge: row.vehicleAge || row["Vehicle Age"] || "",
      seatingCapacity: row.seatingCapacity || row["Seating Capacity"] || "",
      payOutODPercentage: Number(row.payOutODPercentage || row["PayOut OD Percentage"] || 0),
      payOutTPPercentage: Number(row.payOutTPPercentage || row["PayOut TP Percentage"] || 0),
      createdBy: "admin",
      createdOn: new Date(),
      updatedBy: null,
      updatedOn: null,
    }));

    let matchCount = 0;
    let updateCount = 0;

    for (const data of extractedData) {
      const lowerCaseData = {
        policyType: (data.policyType || "").toLowerCase(),
        caseType: (data.caseType || "").toLowerCase(),
        productType: (data.productType || "").toLowerCase(),
        subCategory: (data.subCategory || "").toLowerCase(),
        fuelType: (data.fuelType || "").toLowerCase(),
        weight: (data.weight || 0),
        ncb: (data.ncb || "").toLowerCase(),
        rto: (data.rto || "").toLowerCase(),
        companyName: (data.companyName || "").toLowerCase(),
        make: (data.make || "").toLowerCase(),
        model: (data.model || "").toLowerCase(),
        vehicleAge: (data.vehicleAge || "").toLowerCase(),
        seatingCapacity: data.seatingCapacity,
      };

      const matchingPolicies = await MotorPolicyModel.find({
        policyType: { $regex: `^${lowerCaseData.policyType}$`, $options: "i" },
        caseType: { $regex: `^${lowerCaseData.caseType}$`, $options: "i" },
        productType: { $regex: `^${lowerCaseData.productType}$`, $options: "i" },
        subCategory: { $regex: `^${lowerCaseData.subCategory}$`, $options: "i" },
        fuelType: { $regex: `^${lowerCaseData.fuelType}$`, $options: "i" },
        weight: lowerCaseData.weight,
        ncb: { $regex: `^${lowerCaseData.ncb}$`, $options: "i" },
        rto: { $regex: `^${lowerCaseData.rto}$`, $options: "i" },
        companyName: { $regex: `^${lowerCaseData.companyName}$`, $options: "i" },
        make: { $regex: `^${lowerCaseData.make}$`, $options: "i" },
        model: { $regex: `^${lowerCaseData.model}$`, $options: "i" },
        vehicleAge: { $regex: `^${lowerCaseData.vehicleAge}$`, $options: "i" },
        seatingCapacity: lowerCaseData.seatingCapacity
      }, 'policyNumber');

      if (matchingPolicies.length > 0) {
        matchCount += matchingPolicies.length;
        const policyNumbers = matchingPolicies.map(policy => policy.policyNumber);

        const motorPolicyRecords = await MotorPolicyPaymentModel.find({
          policyNumber: { $in: policyNumbers }
        });

        for (const motorPolicyRecord of motorPolicyRecords) {
          let updated = false;

          const payOutODPercentage = data.payOutODPercentage || motorPolicyRecord.payOutODPercentage || 0;
          const payOutTPPercentage = data.payOutTPPercentage || motorPolicyRecord.payOutTPPercentage || 0;

          const calculatedPayOutODAmount = Math.round(
            (motorPolicyRecord.od * payOutODPercentage) / 100
          );
          const calculatedPayOutTPAmount = Math.round(
            (motorPolicyRecord.tp * payOutTPPercentage) / 100
          );
          const payOutCommission = calculatedPayOutODAmount + calculatedPayOutTPAmount;

          if (
            motorPolicyRecord.payOutODPercentage !== payOutODPercentage ||
            motorPolicyRecord.payOutTPPercentage !== payOutTPPercentage ||
            motorPolicyRecord.payOutODAmount !== calculatedPayOutODAmount ||
            motorPolicyRecord.payOutTPAmount !== calculatedPayOutTPAmount ||
            motorPolicyRecord.payOutCommission !== payOutCommission
          ) {
            updated = true;
            motorPolicyRecord.payOutODPercentage = payOutODPercentage;
            motorPolicyRecord.payOutTPPercentage = payOutTPPercentage;
            motorPolicyRecord.payOutODAmount = calculatedPayOutODAmount;
            motorPolicyRecord.payOutTPAmount = calculatedPayOutTPAmount;
            motorPolicyRecord.payOutCommission = payOutCommission;
            motorPolicyRecord.updatedBy = "admin";
            motorPolicyRecord.updatedOn = new Date();
            await motorPolicyRecord.save();
          }

          if (updated) {
            updateCount++;
          }
        }
      }
    }

    storedHashes.push(fileHash);
    fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));

    res.status(200).json({
      message: "File uploaded and data processed successfully.",
      matchCount,
      updateCount,
      status: "Success"
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file.", status: "Failure" });
  }
};

const updatePayOutValuesByPolicyNumber = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No files were uploaded.");
      }
  
      const file = req.file;
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });
  
      const extractedData = worksheet.map((row) => ({
        policyNumber: row.policyNumber || row["Policy Number"] || "",
        payOutODPercentage: Number(row.payOutODPercentage || row["PayOut OD Percentage"] || 0),
        payOutTPPercentage: Number(row.payOutTPPercentage || row["PayOut TP Percentage"] || 0),
      }));
  
      for (const data of extractedData) {
        const { policyNumber, payOutODPercentage, payOutTPPercentage } = data;
  
        if (policyNumber) {
          const motorPolicyRecord = await MotorPolicyPaymentModel.findOne({ policyNumber });
  
          if (!motorPolicyRecord) {
            continue;
          }
  
          const payOutODPercent = Number(payOutODPercentage) || motorPolicyRecord.payOutODPercentage || 0;
          const payOutTPPercent = Number(payOutTPPercentage) || motorPolicyRecord.payOutTPPercentage || 0;
  
          const calculatedPayOutODAmount = Math.round((motorPolicyRecord.od * payOutODPercent) / 100);
          const calculatedPayOutTPAmount = Math.round((motorPolicyRecord.tp * payOutTPPercent) / 100);
          const payOutCommission = calculatedPayOutODAmount + calculatedPayOutTPAmount;
  
          motorPolicyRecord.payOutODPercentage = payOutODPercent;
          motorPolicyRecord.payOutTPPercentage = payOutTPPercent;
          motorPolicyRecord.payOutODAmount = calculatedPayOutODAmount;
          motorPolicyRecord.payOutTPAmount = calculatedPayOutTPAmount;
          motorPolicyRecord.payOutCommission = payOutCommission;
          motorPolicyRecord.updatedBy = "admin";
          motorPolicyRecord.updatedOn = new Date();
          await motorPolicyRecord.save();
  
          // Update the PayOutExcelDataModel
          await PayOutExcelDataModel.findOneAndUpdate(
            { policyNumber },
            { payOutODPercentage, payOutTPPercentage },
            { new: true }
          );
        }
      }
  
      res.status(200).json({
        message: "PayOut percentages updated successfully from uploaded file",
        status: "Success",
      });
    } catch (error) {
      console.error("Error updating PayOut percentages:", error);
      res.status(500).json({
        message: "Error updating PayOut percentages",
        error: error.message,
      });
    }
  };

const getAllData = async (req, res) => {
  try {
    // Fetch data only from MongoDB
    const dataFromMongo = await PayOutExcelDataModel.find();
    res.status(200).json({
      message: "Data retrieved successfully.",
      data: dataFromMongo,
      status: "Success",
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res
      .status(500)
      .json({ message: "Error retrieving data", error: error.message });
  }
};

export { uploadExcel, getAllData, updatePayOutValuesByPolicyNumber };
