import fs from "fs";
import { PDFExtract } from "pdf.js-extract";

// Utility to extract data using regex patterns
const extractField = (pattern, text) => {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

// Extract case type based on policy number
const extractCaseType = (policyNumber) => {
  if (!policyNumber) return null;
  return policyNumber.toLowerCase().includes("new") ? "New" : "Rollover";
};

// Extract RTO and vehicle number from registration number
const extractRtoAndVehicleNumber = (registrationNumber) => {
  if (!registrationNumber) return { rto: null, vehicleNumber: null };
  const rto = registrationNumber.substring(0, 4);
  return { rto, vehicleNumber: registrationNumber };
};

// Extract IDV (Insured Declared Value) from PDF text
const extractIDV = (text) => {
  const idvPattern = /Total\s*IDV\s*₹?\s*(\d+)/i;
  return extractField(idvPattern, text);
};

// Dynamically extract vehicle details like make, model, etc.
const extractVehicleDetailsDynamic = (text) => {
  const vehicleRegex = /(?:Registration\s*Number|Reg\s*No)\s*:\s*([A-Za-z0-9]+)/i;
  const makeModelRegex = /(?:Make\/Model)\s*:\s*([\w\s]+)\/([\w\s]+)/i;
  const mfgYearRegex = /(?:Mfg\.?\s*Year|Year of Manufacture)\s*:\s*(\d{4})/i;
  const ccKwRegex = /(?:CC\/KW|Engine Capacity)\s*:\s*(\d+)/i;
  const capacityRegex = /(?:Licensed Carrying Capacity|Seating Capacity)\s*:\s*(\d+)/i;

  return {
    vehicleNumber: extractField(vehicleRegex, text),
    make: extractField(makeModelRegex, text),
    model: extractField(makeModelRegex, text),
    mfgYear: extractField(mfgYearRegex, text),
    ccKw: extractField(ccKwRegex, text),
    licensedCarryingCapacity: extractField(capacityRegex, text),
  };
};

// Extract broker details from PDF
const extractBroker = (text) => {
  const brokerPattern = /Agent Name:\s*([A-Za-z\s]+)\s*Agent License Code/i;
  return extractField(brokerPattern, text);
};

// Extract full name of policyholder
const extractFullName = (text) => {
  const fullNamePattern = /Name:\s*([A-Za-z\s]+)\s*Address/i;
  return extractField(fullNamePattern, text);
};

// Extract product type
const extractProductType = (text) => {
  const productTypePattern = /Commercial Class:\s*([A-Za-z\s]+)\s*Alternate Policy No/i;
  return extractField(productTypePattern, text);
};

// Extract final premium from PDF
const extractFinalPremium = (text) => {
  const finalPremiumPattern = /TOTAL POLICY PREMIUM\s*₹?\s*([\d,.]+)/i;
  const premium = extractField(finalPremiumPattern, text);
  return premium ? parseFloat(premium.replace(/,/g, "")) : null;
};

// Main PDF parsing function
export const PDFParsing = async (req, res) => {
  const filePath = req.files["file"][0].path;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  try {
    const pdfExtract = new PDFExtract();
    pdfExtract.extract(filePath, {}, (err, data) => {
      if (err) {
        console.error("Error extracting PDF:", err);
        return res.status(500).json({ message: "Error extracting PDF", error: err });
      }

      // Extract text from each page
      const extractedText = data.pages
        .map((page) => page.content.map((item) => item.str).join(" "))
        .join("\n");

      // Construct extracted data object
      const extractedData = {
        policyNumber: extractField(/Policy Number:\s*([\d\s]+)/, extractedText),
        caseType: extractCaseType(extractField(/Policy Number:\s*([\d\s]+)/, extractedText)),
        netPremium: parseFloat(extractField(/NET PREMIUM \(A\+B\+C\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        totalIDV: parseFloat(extractIDV(extractedText)) || null,
        ...extractVehicleDetailsDynamic(extractedText),  
        policyType: extractField(/Policy Type\s*:\s*([A-Za-z\s-]+)/i, extractedText),
        fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/i, extractedText),
        totalLiabilityPremium: parseFloat(extractField(/TOTAL\s*LIABILITY\s*PREMIUM\s*\(B\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        totalOwnDamagePremium: parseFloat(extractField(/TOTAL\s*OWN\s*DAMAGE\s*PREMIUM\s*\(A\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        issuedDate: new Date(extractField(/Own Damage period of insurance desired from\*:\s*(\d{2}\/\d{2}\/\d{4})/, extractedText)) || null,
        endDate: new Date(extractField(/to Midnight of (\d{2}\/\d{2}\/\d{4})/, extractedText)) || null,
        typeOfCover: extractField(/Type of Cover\s*:\s*(Package\s*\(\d{1,2} year OD\s*\+\s*\d{1,2} year TP\))/i, extractedText),
        fullName: extractFullName(extractedText),
        //broker: extractBroker(extractedText),
        phoneNumber: extractField(/Contact Number:\s*(\d{10})/, extractedText),
        rto: extractRtoAndVehicleNumber(extractField(/Registration\s*Number:\s*([A-Za-z0-9]+)/, extractedText)).rto,
        vehicleNumber: extractRtoAndVehicleNumber(extractField(/Registration\s*Number:\s*([A-Za-z0-9]+)/, extractedText)).vehicleNumber,
        productType: extractProductType(extractedText),
        finalPremium: extractFinalPremium(extractedText),
        category: "motor", // Assuming motor policy
      };

      return res.status(200).json({
        message: "PDF data extracted successfully",
        data: extractedData,
      });
    });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return res.status(500).json({
      message: "Error parsing PDF",
      error: error.message,
    });
  }
};
