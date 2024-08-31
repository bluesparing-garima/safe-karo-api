import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PayOutExcelDataModel from "../../models/adminModels/payOutExcelDataSchema.js";
import MotorPolicyPaymentModel from "../../models/policyModel/motorPolicyPaymentSchema.js";

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
        return res
          .status(400)
          .json({ message: "File has already been uploaded." });
      }
  
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      const extractedData = worksheet.map((row) => ({
        productType: (row.productType || row["Product Type"] || "").toLowerCase(),
        subCategory: (row.subCategory || row["SubCategory"] || "").toLowerCase(),
        fuelType: (row.fuelType || row["Fuel Type"] || "").toLowerCase(),
        engine: row.engine || row["Engine"] || "",
        weight: row.weight || row["Weight"] || "0",
        ncb: (row.ncb || row["NCB"] || "").toLowerCase(),
        policyType: (row.policyType || row["Policy Type"] || "").toLowerCase(),
        rto: (row.rto || row["RTO"] || "").toLowerCase(),
        caseType: (row.caseType || row["Case Type"] || "").toLowerCase(),
        companyName: (row.companyName || row["Company Name"] || "").toLowerCase(),
        make: (row.make || row["Make"] || "").toLowerCase(),
        model: (row.model || row["Model"] || "").toLowerCase(),
        vehicleAge: (row.vehicleAge || row["Vehicle Age"] || "").toLowerCase(),
        od: row.od || row["OD"] || "",
        tp: row.tp || row["TP"] || "",
        createdBy: "admin",
        createdOn: new Date(),
        updatedBy: null,
        updatedOn: null,
      }));
  
      let newRecords = [];
      let updatedRecords = [];
  
      for (const record of extractedData) {
        const existingRecord = await PayOutExcelDataModel.findOne({
          productType: record.productType,
          subCategory: record.subCategory,
          fuelType: record.fuelType,
          engine: record.engine,
          weight: record.weight,
          ncb: record.ncb,
          policyType: record.policyType,
          rto: record.rto,
          caseType: record.caseType,
          companyName: record.companyName,
          make: record.make,
          model: record.model,
          vehicleAge: record.vehicleAge,
        });
  
        if (existingRecord) {
          existingRecord.od = record.od;
          existingRecord.tp = record.tp;
          existingRecord.updatedBy = "admin";
          existingRecord.updatedOn = new Date();
          await existingRecord.save();
          updatedRecords.push(existingRecord);
        } else {
          newRecords.push(record);
        }
      }
  
      if (newRecords.length > 0) {
        await PayOutExcelDataModel.insertMany(newRecords);
      }
  
      // Update MotorPolicyPaymentModel based on the PayOutExcelDataModel
      for (const record of extractedData) {
        const motorPolicyRecord = await MotorPolicyPaymentModel.findOne({
          productType: record.productType,
          subCategory: record.subCategory,
          fuelType: record.fuelType,
          engine: record.engine,
          weight: record.weight,
          ncb: record.ncb,
          policyType: record.policyType,
          rto: record.rto,
          caseType: record.caseType,
          companyName: record.companyName,
          make: record.make,
          model: record.model,
          vehicleAge: record.vehicleAge,
        });
  
        if (motorPolicyRecord) {
          const calculatedPayOutODAmount = Math.round(
            (motorPolicyRecord.od * (Number(record.od) || 0)) / 100
          );
          const calculatedPayOutTPAmount = Math.round(
            (motorPolicyRecord.tp * (Number(record.tp) || 0)) / 100
          );
          const payOutCommission = calculatedPayOutODAmount + calculatedPayOutTPAmount;
  
          motorPolicyRecord.payOutODAmount = calculatedPayOutODAmount;
          motorPolicyRecord.payOutTPAmount = calculatedPayOutTPAmount;
          motorPolicyRecord.payOutCommission = payOutCommission;
          motorPolicyRecord.updatedBy = "admin";
          motorPolicyRecord.updatedOn = new Date();
          await motorPolicyRecord.save();
        }
      }
  
      let existingData = [];
      if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        existingData = JSON.parse(rawData);
      }
  
      existingData.push(...newRecords);
      fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));
  
      // Store the hash of the newly uploaded file
      storedHashes.push(fileHash);
      fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));
  
      res.status(200).json({
        message: "File uploaded and data processed successfully.",
        newRecords,
        updatedRecords,
        status: "Success",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res
        .status(500)
        .json({ message: "Error processing file", error: error.message });
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
