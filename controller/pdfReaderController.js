import fs from 'fs';
import { PDFExtract } from 'pdf.js-extract';

// Function to extract a field using a regex pattern for normal format
const extractField = (pattern, text) => {
  const match = text.match(pattern);
  return match ? match[1].trim() : 'Not found';
};

// Function to extract IDV from a table
const extractIDV = (text) => {
  const idvPattern = /Total\s*IDV\s*₹?\s*(\d+)/i;
  return extractField(idvPattern, text);
};

// Function to extract Manufacturing Year or Mfg Year from a table
const extractMfgYear = (text) => {
  const mfgYearPattern = /(?:Mfg\.?\s*Year\s*|Mfg\s*)(\d{4})/i;
  return extractField(mfgYearPattern, text);
};

// Function to extract CC/KW or CC from a table
const extractCcKw = (text) => {
  const ccKwPattern = /(?:CC\/KW\s*|CC\s*|KW\s*)(\d+)/i;
  return extractField(ccKwPattern, text);
};

const extractLicensedCarryingCapacity = (text) => {
  const carryingCapacityPattern = /Licensed\s*Carrying\s*Capacity\s*Including\s*Driver\s*(\d+)/i;
  return extractField(carryingCapacityPattern, text);
};

export const testPDFParsing = async (req, res) => {
  const filePath = req.files['file'][0].path;

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).json({ message: "File not found" });
  }

  try {
    const pdfExtract = new PDFExtract();
    pdfExtract.extract(filePath, {}, (err, data) => {
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
        basicODPremium: extractField(/Basic OD Premium\s*₹\s*([\d,.]+)/i, extractedText),
        basicTPPremium: extractField(/Basic TP Premium\s*₹\s*([\d,.]+)/i, extractedText),
        netPremium: extractField(/NET PREMIUM \(A\+B\+C\)\s*₹\s*([\d,.]+)/i, extractedText),
        totalIDV: extractIDV(extractedText),
        mfgYear: extractMfgYear(extractedText),
        ccKw: extractCcKw(extractedText),
        licensedCarryingCapacity: extractLicensedCarryingCapacity(extractedText),
        policyType: extractField(/Policy Type\s*:\s*([A-Za-z\s-]+)/i, extractedText),
        fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/i, extractedText),
        totalLiabilityPremium: extractField(/TOTAL\s*LIABILITY\s*PREMIUM\s*\(B\)\s*₹\s*([\d,.]+)/i, extractedText),
        totalOwnDamagePremium: extractField(/TOTAL\s*OWN\s*DAMAGE\s*PREMIUM\s*\(A\)\s*₹\s*([\d,.]+)/i, extractedText),
        issuedDate: extractField(/Own Damage period of insurance desired from\*:\s*(\d{2}\/\d{2}\/\d{4})/, extractedText),
        endDate: extractField(/to Midnight of (\d{2}\/\d{2}\/\d{4})/, extractedText),
        typeOfCover: extractField(/Type of Cover\s*:\s*(Package\s*\(\d{1,2} year OD\s*\+\s*\d{1,2} year TP\))/i, extractedText),
      };

      return res.status(200).json({
        message: "PDF uploaded and data extracted successfully",
        data: extractedData,
      });
    });
  } catch (error) {
    console.error("Error parsing PDF:", error.message);
    return res.status(500).json({
      message: "Failed to extract data from PDF",
      error: error.message,
    });
  }
};
