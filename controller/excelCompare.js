import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import MotorPolicy from "../models/policyModel/motorpolicySchema.js";
import MotorPolicyPayment from "../models/policyModel/motorPolicyPaymentSchema.js";

const dataFilePath = path.join(process.cwd(), "data", "data.json");

const partnerDataFilePath = path.join(
  process.cwd(),
  "data",
  "partnerData.json"
);

if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}
export const compareBrokerExcel = async (req, res) => {
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
      const paymentRow = paymentData.find(
        (paymentItem) => paymentItem.policyNumber === dbRow.policyNumber
      );
      const excelRow = extractedData.find(
        (excelItem) => excelItem.policyNumber === dbRow.policyNumber
      );

      const dbDetails = {
        policyNumber: dbRow.policyNumber,
        broker: dbRow.broker,
        payInCommission: paymentRow ? paymentRow.payInCommission : 0,
        // payInAmount: paymentRow ? paymentRow.payInAmount : null,
        // payInPaymentStatus: paymentRow ? paymentRow.payInPaymentStatus : null,
        // payInBalance: paymentRow ? paymentRow.payInBalance : null,
      };

      const excelDetails = excelRow || {
        policyNumber: dbRow.policyNumber,
        payInCommission: 0,
      };

      const commissionDifference =
        excelRow && paymentRow
          ? paymentRow.payInCommission - excelRow.payInCommission
          : null;

      return {
        broker: dbRow.broker,
        db: dbDetails,
        excel: excelDetails,
        commissionDifference,
        hasDifference:
          excelRow &&
          paymentRow &&
          excelRow.payInCommission !== paymentRow.payInCommission,
      };
    });

    const response = {
      broker: differences[0]?.broker,
      message: "File uploaded and data processed successfully.",
      status: "Success",
      data: differences.map((diff) => ({
        policyNumber: diff.db.policyNumber || diff.excel.policyNumber,
        broker: diff.db.broker,
        safeKaroCommission: diff.db.payInCommission || 0, // db commission
        brokerCommission: diff.excel.payInCommission, // excel commission
        commissionDifference: diff.commissionDifference,
        hasDifference: diff.hasDifference,
      })),
    };

    fs.writeFileSync(dataFilePath, JSON.stringify(response, null, 2));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing file:", error);
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
};

export const comparePartnerExcel = async (req, res) => {
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
      const paymentRow = paymentData.find(
        (paymentItem) => paymentItem.policyNumber === dbRow.policyNumber
      );
      const excelRow = extractedData.find(
        (excelItem) => excelItem.policyNumber === dbRow.policyNumber
      );

      const dbDetails = {
        policyNumber: dbRow.policyNumber,
        broker: dbRow.broker,
        payInCommission: paymentRow ? paymentRow.payInCommission : 0,
        // payInAmount: paymentRow ? paymentRow.payInAmount : null,
        // payInPaymentStatus: paymentRow ? paymentRow.payInPaymentStatus : null,
        // payInBalance: paymentRow ? paymentRow.payInBalance : null,
      };

      const excelDetails = excelRow || {
        policyNumber: dbRow.policyNumber,
        payInCommission: 0,
      };

      const commissionDifference =
        excelRow && paymentRow
          ? paymentRow.payInCommission - excelRow.payInCommission
          : null;

      return {
        broker: dbRow.broker,
        db: dbDetails,
        excel: excelDetails,
        commissionDifference,
        hasDifference:
          excelRow &&
          paymentRow &&
          excelRow.payInCommission !== paymentRow.payInCommission,
      };
    });

    const response = {
      broker: differences[0]?.broker,
      message: "File uploaded and data processed successfully.",
      status: "Success",
      data: differences.map((diff) => ({
        policyNumber: diff.db.policyNumber || diff.excel.policyNumber,
        broker: diff.db.broker,
        safeKaroCommission: diff.db.payInCommission || 0, // db commission
        brokerCommission: diff.excel.payInCommission, // excel commission
        commissionDifference: diff.commissionDifference,
        hasDifference: diff.hasDifference,
      })),
    };

    fs.writeFileSync(partnerDataFilePath, JSON.stringify(response, null, 2));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing file:", error);
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
};
