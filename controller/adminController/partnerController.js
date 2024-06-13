// controllers/partnerIdController.js
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import PartnerModel from '../../models/partnerSchema.js';

// Path to local JSON file for storing data
const dataFilePath = path.join(process.cwd(), 'data', 'partnerData.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Parse Date Helper Function
const parseDate = (dateString) => {
    if (!dateString) {
        return null;
    }

    const formats = ['DD-MM-YYYY', 'DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
    const parsedDate = moment(dateString, formats, true);

    if (parsedDate.isValid()) {
        return parsedDate.toDate();
    }

    console.warn(`Invalid date format for input: "${dateString}"`);
    return null;
};

const uploadPartnerIdExcel = async (req, res) => {
    try {
        if (!req.files || !req.files.excel) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.excel;

        // Read the Excel file
        const workbook = XLSX.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const processedPartnerIds = new Set();
        const processedEmails = new Set();
        const validData = [];

        for (const row of worksheet) {
            const partnerId = row.PartnerId || row['Partner Id'];
            const email = row.Email || row['Email'];

            // Check for mandatory partnerId
            if (!partnerId) {
                console.warn(`Skipping row with missing PartnerId`);
                continue;
            }

            // Skip if the partnerId or email has already been processed
            if (processedPartnerIds.has(partnerId) || processedEmails.has(email)) {
                console.warn(`Skipping row with duplicate PartnerId or Email: "${partnerId}", "${email}"`);
                continue;
            }

            // Check if partnerId or email already exists in the database
            const existingPartner = await PartnerModel.findOne({
                $or: [{ partnerId: partnerId }, { email: email }]
            });

            if (existingPartner) {
                console.warn(`Skipping row with existing PartnerId or Email in database: "${partnerId}", "${email}"`);
                continue;
            }

            const dateOfBirth = parseDate(row['DateOfBirth'] || row['Date of Birth']);

            // Assemble the data object, ensuring defaults for missing fields
            validData.push({
                partnerId: partnerId,
                name: row.Name || '',
                mobile: row.Mobile || '',
                email: email,
                dateOfBirth: dateOfBirth,
                gender: row.Gender || '',
                password: row.Password || '',
                address: row.Address || '',
                pincode: row.Pincode || '',
                wallet: parseFloat(row.Wallet) || 0,
                createdOn: new Date(),
                updatedOn: null
            });

            processedPartnerIds.add(partnerId);
            processedEmails.add(email);
        }

        // Insert valid data into MongoDB
        if (validData.length > 0) {
            await PartnerModel.insertMany(validData);
        }

        // Read existing data from the file
        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath);
            existingData = JSON.parse(rawData);
        }

        // Append the new valid data
        existingData.push(...validData);

        // Write updated data back to the file
        fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

        res.status(200).json({
            message: 'File uploaded and data processed successfully.',
            data: validData,
            status: "Success"
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: 'Error processing file', error: error.message });
    }
};

const getAllPartners = async (req, res) => {
    try {
        const partners = await PartnerModel.find();
        res.status(200).json({
            message: 'Data retrieved successfully.',
            data:  partners ,
            status: "Success"
        });
    } catch (error) {
        console.error("Error retrieving data:", error);
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
};

export { uploadPartnerIdExcel, getAllPartners };
