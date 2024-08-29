import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import MotorPolicy from "../models/policyModel/motorpolicySchema.js";
import MotorPolicyPayment from "../models/policyModel/motorPolicyPaymentSchema.js";

// Define the path for storing data
const dataFilePath = path.join(process.cwd(), "data", "data.json");

// Ensure the 'data' directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

export const compareBrokerExcel = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded." });
    }

    const file = req.file;

    // Read and parse the Excel file
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Extract data from the worksheet
    const extractedData = worksheet.map((row) => ({
      policyNumber: row.policyNumber,
      payInCommission: row.payInCommission,
      broker: row.broker,
    }));

    const policyNumbers = extractedData.map((data) => data.policyNumber);
    const brokers = [...new Set(extractedData.map((data) => data.broker))];

    // Fetch relevant policy and payment data from the database
    const dbData = await MotorPolicy.find({ broker: { $in: brokers } });
    const paymentData = await MotorPolicyPayment.find({
      policyNumber: { $in: dbData.map((data) => data.policyNumber) },
    });

    // Map database policy data for quick lookup
    const dbPolicyMap = new Map(dbData.map((dbRow) => [dbRow.policyNumber, dbRow]));

    // Combine policy numbers from both the Excel file and the database
    const allPolicyNumbers = [...new Set([...policyNumbers, ...dbData.map((dbRow) => dbRow.policyNumber)])];

    // Compare data between the Excel file and the database
    const allData = allPolicyNumbers.map((policyNumber) => {
      const dbRow = dbPolicyMap.get(policyNumber);
      const excelRow = extractedData.find((excelItem) => excelItem.policyNumber === policyNumber);

      const brokerName = dbRow?.broker || excelRow?.broker || "Unknown Broker";

      const dbDetails = {
        policyNumber,
        broker: brokerName,
        payInCommission: dbRow
          ? paymentData.find((paymentItem) => paymentItem.policyNumber === dbRow.policyNumber)?.payInCommission || 0
          : 0,
      };

      const excelDetails = excelRow || {
        policyNumber,
        payInCommission: 0,
        broker: brokerName,
      };

      const commissionDifference = dbDetails.payInCommission - excelDetails.payInCommission;

      return {
        broker: brokerName,
        db: dbDetails,
        excel: excelDetails,
        commissionDifference,
        hasDifference: commissionDifference !== 0,
      };
    });

    // Find additional database data that is not in the Excel file
    const additionalDbData = await MotorPolicy.find({ broker: { $nin: brokers } });

    const additionalData = additionalDbData.map((dbRow) => {
      const paymentRow = paymentData.find((paymentItem) => paymentItem.policyNumber === dbRow.policyNumber);

      return {
        broker: dbRow.broker,
        db: {
          policyNumber: dbRow.policyNumber,
          broker: dbRow.broker,
          payInCommission: paymentRow ? paymentRow.payInCommission : 0,
        },
        excel: {
          policyNumber: dbRow.policyNumber,
          payInCommission: 0,
          broker: dbRow.broker,
        },
        commissionDifference: paymentRow ? paymentRow.payInCommission : 0,
        hasDifference: true,
      };
    });

    // Construct response
    const response = {
      broker: extractedData[0]?.broker || "Unknown Broker",
      message: "File uploaded and data processed successfully.",
      status: "Success",
      data: [...allData, ...additionalData].map((diff) => ({
        policyNumber: diff.db.policyNumber || diff.excel.policyNumber,
        broker: diff.broker,
        safeKaroCommission: diff.db.payInCommission,
        brokerCommission: diff.excel.payInCommission,
        commissionDifference: diff.commissionDifference,
        hasDifference: diff.hasDifference,
      })),
    };

    // Write response data to file
    fs.writeFileSync(dataFilePath, JSON.stringify(response, null, 2));

    // Send response
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file", error: error.message });
  }
};

export const comparePartnerExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.file;

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const extractedData = worksheet.map((row) => ({
      policyNumber: row.policyNumber,
      payOutCommission: row.payOutCommission,
      partnerName: row.partnerName,
    }));

    const policyNumbers = extractedData.map((data) => data.policyNumber);
    const partnerNames = new Set(extractedData.map((data) => data.partnerName));

    const dbData = await MotorPolicy.find({
      partnerName: { $in: Array.from(partnerNames) },
    });

    const paymentData = await MotorPolicyPayment.find({
      policyNumber: { $in: dbData.map((data) => data.policyNumber) },
    });

    const dbPolicyMap = new Map(
      dbData.map((dbRow) => [dbRow.policyNumber, dbRow])
    );

    const policyPartnerMap = new Map();
    dbData.forEach((row) => {
      if (!policyPartnerMap.has(row.policyNumber)) {
        policyPartnerMap.set(row.policyNumber, new Set());
      }
      policyPartnerMap.get(row.policyNumber).add(row.partnerName);
    });

    const invalidPolicyNumbers = Array.from(policyPartnerMap.entries())
      .filter(([_, partners]) => partners.size > 1)
      .map(([policyNumber]) => policyNumber);

    const allData = [
      ...policyNumbers,
      ...dbData.map((dbRow) => dbRow.policyNumber),
    ]
      .filter(
        (policyNumber, index, self) => self.indexOf(policyNumber) === index
      )
      .filter((policyNumber) => !invalidPolicyNumbers.includes(policyNumber))
      .map((policyNumber) => {
        const dbRow = dbPolicyMap.get(policyNumber);
        const excelRow = extractedData.find(
          (excelItem) => excelItem.policyNumber === policyNumber
        );

        const partnerName =
          dbRow?.partnerName || excelRow?.partnerName || "Unknown partnerName";

        const dbDetails = {
          policyNumber: policyNumber,
          partnerName: partnerName,
          payOutCommission: dbRow
            ? paymentData.find(
                (paymentItem) => paymentItem.policyNumber === dbRow.policyNumber
              )?.payOutCommission || 0
            : 0,
        };

        const excelDetails = excelRow || {
          policyNumber: policyNumber,
          payOutCommission: 0,
          partnerName: partnerName,
        };

        const commissionDifference =
          dbDetails.payOutCommission - excelDetails.payOutCommission;

        return {
          partnerName: partnerName,
          db: dbDetails,
          excel: excelDetails,
          commissionDifference,
          hasDifference: commissionDifference !== 0,
        };
      });

    const additionalDbData = await MotorPolicy.find({
      partnerName: { $nin: Array.from(partnerNames) },
    });

    const additionalData = additionalDbData
      .map((dbRow) => {
        const paymentRow = paymentData.find(
          (paymentItem) => paymentItem.policyNumber === dbRow.policyNumber
        );

        return {
          partnerName: dbRow.partnerName,
          db: {
            policyNumber: dbRow.policyNumber,
            partnerName: dbRow.partnerName,
            payOutCommission: paymentRow ? paymentRow.payOutCommission : 0,
          },
          excel: {
            policyNumber: dbRow.policyNumber,
            payOutCommission: 0,
            partnerName: dbRow.partnerName,
          },
          commissionDifference: paymentRow ? paymentRow.payOutCommission : 0,
          hasDifference: true,
        };
      })
      .filter((diff) => partnerNames.has(diff.partnerName));

    const response = {
      partnerName: extractedData[0].partnerName,
      message: "File uploaded and data processed successfully.",
      status: "Success",
      data: [...allData, ...additionalData].map((diff) => ({
        policyNumber: diff.db.policyNumber || diff.excel.policyNumber,
        partnerName: diff.partnerName,
        safeKaroCommission: diff.db.payOutCommission,
        brokerCommission: diff.excel.payOutCommission,
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
