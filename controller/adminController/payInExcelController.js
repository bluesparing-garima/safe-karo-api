import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PayInExcelDataModel from "../../models/adminModels/payInExcelDataSchema.js";
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
      payInODPercentage: Number(row.payInODPercentage || row["PayIn OD Percentage"] || 0),
      payInTPPercentage: Number(row.payInTPPercentage || row["PayIn TP Percentage"] || 0),
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

          const payInODPercentage = data.payInODPercentage || motorPolicyRecord.payInODPercentage || 0;
          const payInTPPercentage = data.payInTPPercentage || motorPolicyRecord.payInTPPercentage || 0;

          const calculatedPayInODAmount = Math.round(
            (motorPolicyRecord.od * payInODPercentage) / 100
          );
          const calculatedPayInTPAmount = Math.round(
            (motorPolicyRecord.tp * payInTPPercentage) / 100
          );
          const payInCommission = calculatedPayInODAmount + calculatedPayInTPAmount;

          if (
            motorPolicyRecord.payInODPercentage !== payInODPercentage ||
            motorPolicyRecord.payInTPPercentage !== payInTPPercentage ||
            motorPolicyRecord.payInODAmount !== calculatedPayInODAmount ||
            motorPolicyRecord.payInTPAmount !== calculatedPayInTPAmount ||
            motorPolicyRecord.payInCommission !== payInCommission
          ) {
            updated = true;
            motorPolicyRecord.payInODPercentage = payInODPercentage;
            motorPolicyRecord.payInTPPercentage = payInTPPercentage;
            motorPolicyRecord.payInODAmount = calculatedPayInODAmount;
            motorPolicyRecord.payInTPAmount = calculatedPayInTPAmount;
            motorPolicyRecord.payInCommission = payInCommission;
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

const updatePayInValuesByPolicyNumber = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: false,
    });

    const extractedData = worksheet.map((row) => ({
      policyNumber: row.policyNumber || row["Policy Number"] || "",
      payInODPercentage: Number(
        row.payInODPercentage || row["PayIn OD Percentage"] || 0
      ),
      payInTPPercentage: Number(
        row.payInTPPercentage || row["PayIn TP Percentage"] || 0
      ),
    }));

    for (const data of extractedData) {
      const { policyNumber, payInODPercentage, payInTPPercentage } = data;

      if (policyNumber) {
        const motorPolicyRecord = await MotorPolicyPaymentModel.findOne({
          policyNumber,
        });

        if (!motorPolicyRecord) {
          continue;
        }

        const payInODPercent =
          Number(payInODPercentage) || motorPolicyRecord.payInODPercentage || 0;
        const payInTPPercent =
          Number(payInTPPercentage) || motorPolicyRecord.payInTPPercentage || 0;

        const calculatedPayInODAmount = Math.round(
          (motorPolicyRecord.od * payInODPercent) / 100
        );
        const calculatedPayInTPAmount = Math.round(
          (motorPolicyRecord.tp * payInTPPercent) / 100
        );
        const payInCommission =
          calculatedPayInODAmount + calculatedPayInTPAmount;

        motorPolicyRecord.payInODPercentage = payInODPercent;
        motorPolicyRecord.payInTPPercentage = payInTPPercent;
        motorPolicyRecord.payInODAmount = calculatedPayInODAmount;
        motorPolicyRecord.payInTPAmount = calculatedPayInTPAmount;
        motorPolicyRecord.payInCommission = payInCommission;
        motorPolicyRecord.updatedBy = "admin";
        motorPolicyRecord.updatedOn = new Date();
        await motorPolicyRecord.save();

        // Update the PayInExcelDataModel
        await PayInExcelDataModel.findOneAndUpdate(
          { policyNumber },
          { payInODPercentage, payInTPPercentage },
          { new: true }
        );
      }
    }

    res.status(200).json({
      message: "PayIn percentages updated successfully from uploaded file",
      status: "Success",
    });
  } catch (error) {
    console.error("Error updating PayIn percentages:", error);
    res.status(500).json({
      message: "Error updating PayIn percentages",
      error: error.message,
    });
  }
};

const getAllData = async (req, res) => {
  try {
    // Fetch data only from MongoDB
    const dataFromMongo = await PayInExcelDataModel.find();
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

export { uploadExcel, getAllData, updatePayInValuesByPolicyNumber };
