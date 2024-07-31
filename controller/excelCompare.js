import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import MotorPolicy from "../models/policyModel/motorpolicySchema.js";
import MotorPolicyPayment from "../models/policyModel/motorPolicyPaymentSchema.js";

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
      payInCommission: row.payInCommission,
    }));

    const policyNumbers = extractedData.map((data) => data.policyNumber);
    const dbData = await MotorPolicy.find({
      policyNumber: { $in: policyNumbers },
    });

    const paymentData = await MotorPolicyPayment.find({
      policyNumber: { $in: policyNumbers },
    });

    const differences = dbData.map((dbRow) => {
      const paymentRow = paymentData.find((paymentItem) => paymentItem.policyNumber === dbRow.policyNumber);
      const excelRow = extractedData.find((excelItem) => excelItem.policyNumber === dbRow.policyNumber);

      const dbDetails = {
        policyNumber: dbRow.policyNumber,
        broker : dbRow.broker,
        payInCommission: paymentRow ? paymentRow.payInCommission : null,
        payInAmount: paymentRow ? paymentRow.payInAmount : null,
        payInPaymentStatus: paymentRow ? paymentRow.payInPaymentStatus : null,
        payInBalance: paymentRow ? paymentRow.payInBalance : null,
      };

      const excelDetails = excelRow || {
        policyNumber: dbRow.policyNumber,
        payInCommission: null,
      };

      return {
        broker: dbRow.broker,
        db: dbDetails,
        excel: excelDetails,
        hasDifference: excelRow && paymentRow && excelRow.payInCommission !== paymentRow.payInCommission,
      };
    });

    const response = {
      broker: differences[0]?.broker || "Unknown Broker",
      message: "File uploaded and data processed successfully.",
      status: "Success",
      data: [
        {
          Excel: differences.map(diff => diff.excel),
        },
        {
          Db: differences.map(diff => diff.db),
        }
      ]
    };

    fs.writeFileSync(dataFilePath, JSON.stringify(response, null, 2));

    res.status(200).json(response);
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
    const wsData = data.data[0].Excel.map((excelRow, index) => {
      const dbRow = data.data[1].Db[index] || {};
      return {
        policyNumber: dbRow.policyNumber || excelRow.policyNumber,
        dbBroker: dbRow.broker || '',
        dbPayInCommission: dbRow.payInCommission || '',
        excelPayInCommission: excelRow.payInCommission || '',
        dbPayInAmount: dbRow.payInAmount,
        dbPayInPaymentStatus: dbRow.payInPaymentStatus,
        dbPayInBalance: dbRow.payInBalance,
        hasDifference: dbRow.payInCommission !== excelRow.payInCommission,
      };
    });

    const ws = XLSX.utils.json_to_sheet(wsData, { header: ["policyNumber", "dbBroker", "dbPayInCommission", "excelPayInCommission", "dbPayInAmount","dbPayInPaymentStatus","dbPayInBalance","hasDifference"] });
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

