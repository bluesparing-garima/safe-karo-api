import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import MotorPolicy from "../models/policyModel/motorpolicySchema.js";
import MotorPolicyPayment from "../models/policyModel/motorPolicyPaymentSchema.js"

const dataFilePath = path.join(process.cwd(), "data", "data.json");

if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

export const compareExcel = async (req, res) => {
  try {
    if (!req.files || !req.files.excel) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.excel;

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
