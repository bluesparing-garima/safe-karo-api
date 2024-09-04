import fs from 'fs';
import { PDFExtract } from 'pdf.js-extract';
import PdfData from '../models/pdfExtractedModel.js';

const extractField = (pattern, text) => {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractIDV = (text) => {
  const idvPattern = /Total\s*IDV\s*₹?\s*(\d+)/i;
  return extractField(idvPattern, text);
};

const extractMfgYear = (text) => {
  const mfgYearPattern = /(?:Mfg\.?\s*Year\s*|Mfg\s*)(\d{4})/i;
  const mfgYear = extractField(mfgYearPattern, text);
  return mfgYear ? new Date(mfgYear, 0, 1) : null; // January 1st of the extracted year
};

const extractCcKw = (text) => {
  const ccKwPattern = /(?:CC\/KW\s*|CC\s*|KW\s*)(\d+)/i;
  return extractField(ccKwPattern, text);
};

const extractLicensedCarryingCapacity = (text) => {
  const carryingCapacityPattern = /Licensed\s*Carrying\s*Capacity\s*Including\s*Driver\s*(\d+)/i;
  return extractField(carryingCapacityPattern, text);
};

// New extractors for the additional fields
const extractMake = (text) => {
  const makePattern = /Make\s*\/\s*Model\s*\/\s*Body Type\s*\/\s*Segment\s*([\w\s]+)\s*\/\s*([\w\s]+)/i;
  const match = text.match(makePattern);
  return match ? match[1].trim() : null;
};

const extractModel = (text) => {
  const modelPattern = /Make\s*\/\s*Model\s*\/\s*Body Type\s*\/\s*Segment\s*([\w\s]+)\s*\/\s*([\w\s]+)/i;
  const match = text.match(modelPattern);
  return match ? match[2].trim() : null;
};

const extractFinalPremium = (text) => {
  const finalPremiumPattern = /TOTAL POLICY PREMIUM\s*₹?\s*([\d,.]+)/i;
  return parseFloat(extractField(finalPremiumPattern, text).replace(/,/g, '')) || null;
};

export const PDFParsing = async (req, res) => {
  const filePath = req.files['file'][0].path;

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).json({ message: "File not found" });
  }

  try {
    const pdfExtract = new PDFExtract();
    pdfExtract.extract(filePath, {}, async (err, data) => {
      if (err) {
        console.error("Error extracting PDF text:", err.message);
        return res.status(500).json({
          message: "Failed to extract data from PDF",
          error: err.message,
        });
      }

      const extractedText = data.pages.map(page => 
        page.content.map(item => item.str).join(' ')
      ).join('\n');

      const extractedData = {
        policyNumber: extractField(/Policy Number:\s*([\d\s]{13,20})/, extractedText),
        //basicODPremium: parseFloat(extractField(/Basic OD Premium\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        //basicTPPremium: parseFloat(extractField(/Basic TP Premium\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        netPremium: parseFloat(extractField(/NET PREMIUM \(A\+B\+C\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        totalIDV: parseFloat(extractIDV(extractedText)) || null,
        mfgYear: extractMfgYear(extractedText),
        ccKw: parseFloat(extractCcKw(extractedText)) || null,
        licensedCarryingCapacity: parseFloat(extractLicensedCarryingCapacity(extractedText)) || null,
        policyType: extractField(/Policy Type\s*:\s*([A-Za-z\s-]+)/i, extractedText),
        fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/i, extractedText),
        totalLiabilityPremium: parseFloat(extractField(/TOTAL\s*LIABILITY\s*PREMIUM\s*\(B\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        totalOwnDamagePremium: parseFloat(extractField(/TOTAL\s*OWN\s*DAMAGE\s*PREMIUM\s*\(A\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        issuedDate: new Date(extractField(/Own Damage period of insurance desired from\*:\s*(\d{2}\/\d{2}\/\d{4})/, extractedText)) || null,
        endDate: new Date(extractField(/to Midnight of (\d{2}\/\d{2}\/\d{4})/, extractedText)) || null,
        typeOfCover: extractField(/Type of Cover\s*:\s*(Package\s*\(\d{1,2} year OD\s*\+\s*\d{1,2} year TP\))/i, extractedText),
        fullName: extractField(/Name:\s*([A-Za-z\s]+)/, extractedText),
        broker: extractField(/Agent Name:\s*([A-Za-z\s]+)/, extractedText),
        phoneNumber: extractField(/Contact Number:\s*(\d{10})/, extractedText),
        make: extractMake(extractedText),
        model: extractModel(extractedText),
        productType: extractField(/Commercial Class:\s*([A-Za-z\s]+)/, extractedText),
        finalPremium: extractFinalPremium(extractedText),
        category:"motor"
      };

      try {
        const pdfData = new PdfData(extractedData);
        await pdfData.save();

        return res.status(200).json({
          message: "PDF uploaded and data extracted successfully",
          data: extractedData,
        });
      } catch (saveError) {
        console.error("Error saving extracted data to the database:", saveError.message);
        return res.status(500).json({
          message: "Failed to save extracted data to the database",
          error: saveError.message,
        });
      }
    });
  } catch (error) {
    console.error("Error parsing PDF:", error.message);
    return res.status(500).json({
      message: "Failed to extract data from PDF",
      error: error.message,
    });
  }
};

// Get all extracted PDF data
export const getAllExtractedData = async (req, res) => {
  try {
    const data = await PdfData.find();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return res.status(500).json({
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

// Get extracted PDF data by ID
export const getExtractedDataById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await PdfData.findById(id);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data by ID:", error.message);
    return res.status(500).json({
      message: "Failed to fetch data by ID",
      error: error.message,
    });
  }
};

// Update extracted PDF data by ID
export const updateExtractedDataById = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedData = await PdfData.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating data:", error.message);
    return res.status(500).json({
      message: "Failed to update data",
      error: error.message,
    });
  }
};

// Delete extracted PDF data by ID
export const deleteExtractedDataById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedData = await PdfData.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return res.status(500).json({
      message: "Failed to delete data",
      error: error.message,
    });
  }
};
