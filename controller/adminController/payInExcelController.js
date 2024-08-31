import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PayInExcelDataModel from "../../models/adminModels/payInExcelDataSchema.js";
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
  
      // Check if the file has already been uploaded
      if (storedHashes.includes(fileHash)) {
        return res
          .status(400)
          .json({ message: "File has already been uploaded." });
      }
  
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        raw: false,
      });
  
      const extractedData = worksheet.map((row) => ({
        policyType: (row.policyType || row["Policy Type"] || "").toLowerCase(),
        caseType: (row.caseType || row["Case Type"] || "").toLowerCase(),
        productType: (row.productType || row["Product Type"] || "").toLowerCase(),
        subCategory: (row.subCategory || row["SubCategory"] || "").toLowerCase(),
        fuelType: (row.fuelType || row["Fuel Type"] || "").toLowerCase(),
       //engine: row.engine || row["Engine"] || "", // engine = cc
        weight: row.weight || row["Weight"] || "0",
        ncb: (row.ncb || row["NCB"] || "").toLowerCase(),
        rto: (row.rto || row["RTO"] || "").toLowerCase(),
        companyName: (row.companyName || row["Company Name"] || "").toLowerCase(),
        make: (row.make || row["Make"] || "").toLowerCase(),
        model: (row.model || row["Model"] || "").toLowerCase(),
        vehicleAge: (row.vehicleAge || row["Vehicle Age"] || "").toLowerCase(),
        seatingCapacity: row.seatingCapacity || row["Seating Capacity"] || "",
        payInODPercentage: Number(
          row.payInODPercentage || row["PayIn OD Percentage"] || 0
        ),
        payInTPPercentage: Number(
          row.payInTPPercentage || row["PayIn TP Percentage"] || 0
        ),
        startDate: formatDateString(row.startDate || row["Start Date"]),
        endDate: formatDateString(row.endDate || row["End Date"]),
        createdBy: "admin",
        createdOn: new Date(),
        updatedBy: null,
        updatedOn: null,
      }));
  
      for (const data of extractedData) {
        console.log('Processing Data:', data);
    
        const query = {
            policyType: data.policyType,
            caseType: data.caseType,
            productType: data.productType,
            subCategory: data.subCategory,
            fuelType: data.fuelType,
            weight: data.weight,
            ncb: data.ncb,
            rto: data.rto,
            companyName: data.companyName,
            make: data.make,
            model: data.model,
            vehicleAge: data.vehicleAge,
            seatingCapacity: data.seatingCapacity,
            startDate: data.startDate,
            endDate: data.endDate,
        };
    
        let existingRecord = await PayInExcelDataModel.findOne(query);
        console.log('Existing Record:', existingRecord);
    
        if (existingRecord) {
            existingRecord.payInODPercentage = data.payInODPercentage;
            existingRecord.payInTPPercentage = data.payInTPPercentage;
            existingRecord.updatedBy = "admin";
            existingRecord.updatedOn = new Date();
            await existingRecord.save();
        } else {
            existingRecord = await PayInExcelDataModel.create(data);
        }
    
        // Update the corresponding MotorPolicyPaymentModel
        const motorPolicyRecord = await MotorPolicyPaymentModel.findOne(query);
        console.log('Motor Policy Record:', motorPolicyRecord);
    
        if (motorPolicyRecord) {
            const payInODPercentage = data.payInODPercentage || motorPolicyRecord.payInODPercentage || 0;
            const payInTPPercentage = data.payInTPPercentage || motorPolicyRecord.payInTPPercentage || 0;
    
            console.log('PayIn OD Percentage:', payInODPercentage);
            console.log('PayIn TP Percentage:', payInTPPercentage);
    
            const calculatedPayInODAmount = Math.round(
                (motorPolicyRecord.od * payInODPercentage) / 100
            );
            const calculatedPayInTPAmount = Math.round(
                (motorPolicyRecord.tp * payInTPPercentage) / 100
            );
            const payInCommission =
                calculatedPayInODAmount + calculatedPayInTPAmount;
    
            console.log('Calculated PayIn OD Amount:', calculatedPayInODAmount);
            console.log('Calculated PayIn TP Amount:', calculatedPayInTPAmount);
            console.log('PayIn Commission:', payInCommission);
    
            motorPolicyRecord.payInODPercentage = payInODPercentage;
            motorPolicyRecord.payInTPPercentage = payInTPPercentage;
            motorPolicyRecord.payInODAmount = calculatedPayInODAmount;
            motorPolicyRecord.payInTPAmount = calculatedPayInTPAmount;
            motorPolicyRecord.payInCommission = payInCommission;
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
  
      const updatedData = existingData.map((existing) => {
        const match = extractedData.find(
          (newData) =>
            newData.policyType === existing.policyType &&
            newData.caseType === existing.caseType &&
            newData.productType === existing.productType &&
            newData.subCategory === existing.subCategory &&
            newData.fuelType === existing.fuelType &&
           // newData.engine === existing.engine &&
            newData.weight === existing.weight &&
            newData.ncb === existing.ncb &&
            newData.rto === existing.rto &&
            newData.companyName === existing.companyName &&
            newData.make === existing.make &&
            newData.model === existing.model &&
            newData.vehicleAge === existing.vehicleAge &&
            newData.seatingCapacity === existing.seatingCapacity &&
            newData.startDate === existing.startDate &&
            newData.endDate === existing.endDate
        );
        if (match) {
          existing.payInODPercentage = match.payInODPercentage;
          existing.payInTPPercentage = match.payInTPPercentage;
        }
        return existing;
      });
  
      const newEntries = extractedData.filter(
        (newData) =>
          !existingData.some(
            (existing) =>
              newData.policyType === existing.policyType &&
              newData.caseType === existing.caseType &&
              newData.productType === existing.productType &&
              newData.subCategory === existing.subCategory &&
              newData.fuelType === existing.fuelType &&
             // newData.engine === existing.engine &&
              newData.weight === existing.weight &&
              newData.ncb === existing.ncb &&
              newData.rto === existing.rto &&
              newData.companyName === existing.companyName &&
              newData.make === existing.make &&
              newData.model === existing.model &&
              newData.vehicleAge === existing.vehicleAge &&
              newData.seatingCapacity === existing.seatingCapacity &&
              newData.startDate === existing.startDate &&
              newData.endDate === existing.endDate
          )
      );
  
      updatedData.push(...newEntries);
      fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));
  
      // Store the hash of the newly uploaded file
      storedHashes.push(fileHash);
      fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));
  
      res.status(200).json({
        message: "File uploaded and data processed successfully.",
        data: extractedData,
        status: "Success",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res
        .status(500)
        .json({ message: "Error processing file", error: error.message });
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
    res
      .status(500)
      .json({
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
