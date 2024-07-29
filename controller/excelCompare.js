import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import MotorPolicy from "../models/policyModel/motorpolicySchema.js";
import MotorPolicyPayment from "../models/policyModel/motorPolicyPaymentSchema.js"

const dataFilePath = path.join(process.cwd(), "data", "data.json");
const hashFilePath = path.join(process.cwd(), "data", "hashes.json");
const firstExcelFilePath = path.join(process.cwd(), "data", "firstExcelData.json");

if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

const computeHash = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

export const compareExcel = async (req, res) => {
  try {
    if (!req.files || !req.files.excel) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.excel;
    const fileHash = computeHash(file.data);

    let storedHashes = [];
    if (fs.existsSync(hashFilePath)) {
      const rawHashData = fs.readFileSync(hashFilePath);
      storedHashes = JSON.parse(rawHashData);
    }

    if (storedHashes.includes(fileHash)) {
      return res.status(400).json({ message: "File has already been uploaded." });
    }

    const workbook = XLSX.read(file.data, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const extractedData = worksheet.map((row) => ({
      policyNumber: row.policyNumber,
      netPremium: row.netPremium,
      payInAmount: row.payInAmount,
      broker: row.broker,
    }));

    const policyNumbers = extractedData.map((data) => data.policyNumber);
    const dbData = await MotorPolicy.find({
      policyNumber: { $in: policyNumbers },
    });

    const paymentData = await MotorPolicyPayment.find({
      policyNumber: { $in: policyNumbers },
    });

    const differences = extractedData.map((excelRow) => {
      const dbRow = dbData.find((dbItem) => dbItem.policyNumber === excelRow.policyNumber);
      const paymentRow = paymentData.find((paymentItem) => paymentItem.policyNumber === excelRow.policyNumber);

      if (dbRow && paymentRow) {
        return {
          policyNumber: excelRow.policyNumber,
          db: {
            policyNumber: dbRow.policyNumber,
            netPremium: dbRow.netPremium,
            payInAmount: paymentRow.payInAmount,
            broker: dbRow.broker,
          },
          excel: {
            policyNumber: excelRow.policyNumber,
            netPremium: excelRow.netPremium,
            payInAmount: excelRow.payInAmount,
            broker: excelRow.broker,
          },
        };
      }
      return null;
    }).filter((item) => item !== null);

    fs.writeFileSync(dataFilePath, JSON.stringify(differences, null, 2));
    storedHashes.push(fileHash);
    fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));

    res.status(200).json({
      message: "File uploaded and data processed successfully.",
      data: differences,
      status: "Success",
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file", error: error.message });
  }
};

export const compareTwoExcels = async (req, res) => {
  try {
    if (!req.files || !req.files.firstExcel || !req.files.secondExcel) {
      return res.status(400).send("Both files need to be uploaded.");
    }

    const firstFile = req.files.firstExcel;
    const secondFile = req.files.secondExcel;

    const firstWorkbook = XLSX.read(firstFile.data, { type: "buffer" });
    const secondWorkbook = XLSX.read(secondFile.data, { type: "buffer" });

    const firstSheetName = firstWorkbook.SheetNames[0];
    const secondSheetName = secondWorkbook.SheetNames[0];

    const firstWorksheet = XLSX.utils.sheet_to_json(firstWorkbook.Sheets[firstSheetName]);
    const secondWorksheet = XLSX.utils.sheet_to_json(secondWorkbook.Sheets[secondSheetName]);

    const firstData = firstWorksheet.map((row) => ({
      policyNumber: row.policyNumber,
      netPremium: row.netPremium,
      payInAmount: row.payInAmount,
      broker: row.broker,
    }));

    const secondData = secondWorksheet.map((row) => ({
      policyNumber: row.policyNumber,
      netPremium: row.netPremium,
      payInAmount: row.payInAmount,
      broker: row.broker,
    }));

    const differences = firstData.map((firstRow) => {
      const secondRow = secondData.find(
        (secondItem) => secondItem.policyNumber === firstRow.policyNumber
      );
      if (secondRow) {
        return {
          policyNumber: firstRow.policyNumber,
          firstExcel: {
            policyNumber: firstRow.policyNumber,
            netPremium: firstRow.netPremium,
            payInAmount: firstRow.payInAmount,
            broker: firstRow.broker,
          },
          secondExcel: {
            policyNumber: secondRow.policyNumber,
            netPremium: secondRow.netPremium,
            payInAmount: secondRow.payInAmount,
            broker: secondRow.broker,
          },
        };
      }
      return null;
    }).filter((item) => item !== null);

    res.status(200).json({
      message: "Files compared successfully.",
      data: differences,
      status: "Success",
    });
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ message: "Error processing files", error: error.message });
  }
};

export const downloadExcel = async (req, res) => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ message: "No data found." });
    }

    const rawData = fs.readFileSync(dataFilePath);
    const data = JSON.parse(rawData);

    const wb = XLSX.utils.book_new();
    const wsData = data.map((row) => ({
      policyNumber: row.policyNumber,
      dbNetPremium: row.db.netPremium,
      dbPayInAmount: row.db.payInAmount,
      dbBroker: row.db.broker,
      excelNetPremium: row.excel.netPremium,
      excelPayInAmount: row.excel.payInAmount,
      excelBroker: row.excel.broker,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Differences");

    const excelFilePath = path.join(process.cwd(), "data", "differences.xlsx");
    XLSX.writeFile(wb, excelFilePath);

    res.download(excelFilePath, "differences.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file", error: err.message });
      }
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Error generating Excel file", error: error.message });
  }
};

export const getAllDataCompare = async (req, res) => {
  try {
    const dataFromMongo = await MotorPolicy.find();
    res.status(200).json({
      message: "Data retrieved successfully.",
      data: dataFromMongo,
      status: "Success",
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Error retrieving data", error: error.message });
  }
};
