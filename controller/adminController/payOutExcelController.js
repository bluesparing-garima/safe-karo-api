import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import PayOutExcelDataModel from '../../models/adminModels/payOutExcelDataSchema.js';

// Path to local JSON file for storing data
const dataFilePath = path.join(process.cwd(), 'data', 'data.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.file;

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const extractedData = worksheet.map((row) => ({
            productType: (row.productType || row['Product Type'] || '').toLowerCase(),
            subCategory: (row.subCategory || row['SubCategory'] || row['subCategory'] || '').toLowerCase(),
            fuelType: (row.fuelType || row['Fuel Type'] || '').toLowerCase(),
            engine: (row.engine || row['Engine'] || ''), // engine = cc
            weight: (row.weight || row['Weight'] || '0'),
            ncb: (row.ncb || row['NCB'] || '').toLowerCase(),
            policyType: (row.policyType || row['Policy Type'] || '').toLowerCase(),
            rto: (row.rto || row['RTO'] || '').toLowerCase(),
            caseType: (row.caseType || row['Case Type'] || '').toLowerCase(),
            companyName: (row.companyName || row['Company Name'] || '').toLowerCase(),
            make: (row.make || row['Make'] || '').toLowerCase(),
            model: (row.model || row['Model'] || '').toLowerCase(),
            vehicleAge: (row.vehicleAge || row['vehicleAge'] || '').toLowerCase(),
            od: (row.od || row['OD'] || ''),
            tp: (row.tp || row['TP'] || ''),
            createdBy: "admin",
            createdOn: new Date(),
            updatedBy: null,
            updatedOn: null
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
                vehicleAge: record.vehicleAge
            });

            if (existingRecord) {
                // Update od and tp fields only
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

        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath);
            existingData = JSON.parse(rawData);
        }

        existingData.push(...newRecords);
        fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

        res.status(200).json({
            message: 'File uploaded and data processed successfully.',
            newRecords,
            updatedRecords,
            status: "Success"
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: 'Error processing file', error: error.message });
    }
};

const getAllData = async (req, res) => {
    try {
        // Fetch data only from MongoDB
        const dataFromMongo = await PayOutExcelDataModel.find();
        res.status(200).json({
            message: 'Data retrieved successfully.',
            data: dataFromMongo,
            status: "Success"
        });
    } catch (error) {
        console.error("Error retrieving data:", error);
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
};

export { uploadExcel, getAllData };
