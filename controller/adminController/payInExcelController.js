import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PayInExcelDataModel from '../../models/adminModels/payInExcelDataSchema.js';

// Path to local JSON file for storing data
const dataFilePath = path.join(process.cwd(), 'data', 'data.json');
const hashFilePath = path.join(process.cwd(), 'data', 'hashes.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Function to compute hash of file data
const computeHash = (data) => {
    return crypto.createHash('md5').update(data).digest('hex');
};

const uploadExcel = async (req, res) => {
    try {
        if (!req.files || !req.files.excel) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.excel;
        const fileHash = computeHash(file.data);

        let storedHashes = [];
        if (fs.existsSync(hashFilePath)) {
            const rawHashData = fs.readFileSync(hashFilePath);
            storedHashes = JSON.parse(rawHashData);
        }

        // Check if the file has already been uploaded
        if (storedHashes.includes(fileHash)) {
            return res.status(400).json({ message: 'File has already been uploaded.' });
        }

        const workbook = XLSX.read(file.data, { type: 'buffer' });
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

        for (const data of extractedData) {
            const query = {
                productType: data.productType,
                subCategory: data.subCategory,
                fuelType: data.fuelType,
                engine: data.engine,
                weight: data.weight,
                ncb: data.ncb,
                policyType: data.policyType,
                rto: data.rto,
                caseType: data.caseType,
                companyName: data.companyName,
                make: data.make,
                model: data.model,
                vehicleAge: data.vehicleAge
            };

            const existingRecord = await PayInExcelDataModel.findOne(query);

            if (existingRecord) {
                existingRecord.od = data.od;
                existingRecord.tp = data.tp;
                existingRecord.updatedBy = "admin";
                existingRecord.updatedOn = new Date();
                await existingRecord.save();
            } else {
                await PayInExcelDataModel.create(data);
            }
        }

        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath);
            existingData = JSON.parse(rawData);
        }

        const updatedData = existingData.map(existing => {
            const match = extractedData.find(newData =>
                newData.productType === existing.productType &&
                newData.subCategory === existing.subCategory &&
                newData.fuelType === existing.fuelType &&
                newData.engine === existing.engine &&
                newData.weight === existing.weight &&
                newData.ncb === existing.ncb &&
                newData.policyType === existing.policyType &&
                newData.rto === existing.rto &&
                newData.caseType === existing.caseType &&
                newData.companyName === existing.companyName &&
                newData.make === existing.make &&
                newData.model === existing.model &&
                newData.vehicleAge === existing.vehicleAge
            );
            if (match) {
                existing.od = match.od;
                existing.tp = match.tp;
            }
            return existing;
        });

        const newEntries = extractedData.filter(newData => 
            !existingData.some(existing => 
                newData.productType === existing.productType &&
                newData.subCategory === existing.subCategory &&
                newData.fuelType === existing.fuelType &&
                newData.engine === existing.engine &&
                newData.weight === existing.weight &&
                newData.ncb === existing.ncb &&
                newData.policyType === existing.policyType &&
                newData.rto === existing.rto &&
                newData.caseType === existing.caseType &&
                newData.companyName === existing.companyName &&
                newData.make === existing.make &&
                newData.model === existing.model &&
                newData.vehicleAge === existing.vehicleAge
            )
        );

        updatedData.push(...newEntries);
        fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));

        // Store the hash of the newly uploaded file
        storedHashes.push(fileHash);
        fs.writeFileSync(hashFilePath, JSON.stringify(storedHashes, null, 2));

        res.status(200).json({
            message: 'File uploaded and data processed successfully.',
            data: extractedData,
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
        const dataFromMongo = await PayInExcelDataModel.find();
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
