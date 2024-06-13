import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import ExcelDataModel from '../../models/excelDataSchema.js';

// Path to local JSON file for storing data
const dataFilePath = path.join(process.cwd(), 'data', 'data.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

const uploadExcel = async (req, res) => {
    try {
        // Check if the file is uploaded
        if (!req.files || !req.files.excel) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.excel;

        // Read the Excel file
        const workbook = XLSX.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Extract data to match schema fields
        const extractedData = worksheet.map((row) => ({
            vehicleType: row.vehicleType || row['Vehicle Type'],
            subCategory: row.subCategory || row['SubCategory'] || row['subCategory'],
            fuelType: row.fuelType || row['Fuel Type'],
            engine: row.engine || row['Engine'],
            ncb: row.ncb || row['NCB'],
            policyType: row.policyType || row['Policy Type'],
            rto: row.rto || row['RTO'],
            insuredType: row.insuredType || row['Insured Type'],
            caseType: row.caseType || row['Case Type'],
            companyName: row.companyName || row['Company Name'],
            make: row.make || row['Make'],
            model: row.model || row['Model'],
            age: row.age || row['Age'],
            od: row.od || row['OD'],
            tp: row.tp || row['TP'],
            createdBy: "admin",  // Assuming req.user contains the user info
            createdOn: new Date(),  // Automatically set current date/time
            updatedBy: null,  // Initial insert, no update yet
            updatedOn: null  // Initial insert, no update yet
        }));

        // Store in MongoDB
        await ExcelDataModel.insertMany(extractedData);

        // Read existing data from the file
        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath);
            existingData = JSON.parse(rawData);
        }

        // Append the new data to existing data
        existingData.push(...extractedData);

        // Write updated data back to the file
        fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

        // Send a response with the newly added data
        res.status(200).json({
            message: 'File uploaded and data processed successfully.',
            data: extractedData,
            status: "Success"
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: 'Error processing file', error: error.message });
    }
}

const getAllData = async (req, res) => {
    try {
        // Fetch data only from MongoDB
        const dataFromMongo = await ExcelDataModel.find();
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
