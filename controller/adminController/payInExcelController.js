import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import PayInExcelDataModel from '../../models/payInExcelDataSchema.js';

// Path to local JSON file for storing data
const dataFilePath = path.join(process.cwd(), 'data', 'data.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

const uploadExcel = async (req, res) => {
    try {
        if (!req.files || !req.files.excel) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.excel;

        const workbook = XLSX.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const extractedData = worksheet.map((row) => ({
            productType: row.productType || row['Product Type'],
            subCategory: row.subCategory || row['SubCategory'] || row['subCategory'],
            fuelType: row.fuelType || row['Fuel Type'],
            engine: row.engine || row['Engine'], // engine = cc
            weight: row.weight || row['Weight'],
            ncb: row.ncb || row['NCB'],
            policyType: row.policyType || row['Policy Type'],
            rto: row.rto || row['RTO'],
            caseType: row.caseType || row['Case Type'],
            companyName: row.companyName || row['Company Name'],
            make: row.make || row['Make'],
            model: row.model || row['Model'],
            vehicleAge: row.vehicleAge || row['vehicleAge'],
            od: row.od || row['OD'],
            tp: row.tp || row['TP'],
            createdBy: "admin",
            createdOn: new Date(),
            updatedBy: null,
            updatedOn: null
        }));

        await PayInExcelDataModel.insertMany(extractedData);

        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath);
            existingData = JSON.parse(rawData);
        }

        existingData.push(...extractedData);
        fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

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
            message: 'File uploaded and data processed successfully.',
            data: dataFromMongo,
            status: "Success"
        });
    } catch (error) {
        console.error("Error retrieving data:", error);
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
};

export { uploadExcel, getAllData };
