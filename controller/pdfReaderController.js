import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
import moment from "moment";
import policyTypeSchema from "../models/adminModels/policyTypeSchema.js";

const extractField = (pattern, text) => {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractCaseType = (policyNumber) => {
  if (!policyNumber) return null;
  return policyNumber.toLowerCase().includes("new") ? "New" : "Rollover";
};

const extractRtoAndVehicleNumber = (registrationNumber) => {
  if (!registrationNumber) return { rto: null, vehicleNumber: null };
  const rto = registrationNumber.substring(0, 4);
  return { rto, vehicleNumber: registrationNumber };
};

const extractIDV = (text) => {
  const idvPattern = /Total\s*IDV\s*₹?\s*(\d+)/i;
  return extractField(idvPattern, text);
};

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
    cc: extractField(ccKwRegex, text),
    seatingCapacity: extractField(capacityRegex, text),
  };
};

const extractBroker = (text) => {
  const brokerPattern = /Agent Name:\s*([A-Za-z\s]+)\s*Agent License Code/i;
  return extractField(brokerPattern, text);
};

const extractFullName = (text) => {
  const fullNamePattern = /Name:\s*([A-Za-z\s]+)\s*Address/i;
  return extractField(fullNamePattern, text);
};

const extractProductType = (text) => {
  const productTypePattern = /Commercial Class:\s*([A-Za-z\s]+)\s*Alternate Policy No/i;
  return extractField(productTypePattern, text);
};

const extractFinalPremium = (text) => {
  const finalPremiumPattern = /TOTAL POLICY PREMIUM\s*₹?\s*([\d,.]+)/i;
  const premium = extractField(finalPremiumPattern, text);
  return premium ? parseFloat(premium.replace(/,/g, "")) : null;
};

const extractTypeOfCover = (text) => {
  const typeOfCoverPattern = /Package\s*\((\d+)\s*year\s*OD\s*\+\s*(\d+)\s*year\s*TP\)/i;
  const match = text.match(typeOfCoverPattern);
  
  if (match) {
    const [odYear, tpYear] = match.slice(1, 3).map(Number);
    return Math.min(odYear, tpYear);
  } 
  return 0;
};

// New function to extract NCB (No Claim Bonus)
const extractNCB = (text) => {
  const ncbPattern = /NCB claimed\s*:\s*([A-Za-z]+)/i;
  const ncbValue = extractField(ncbPattern, text);
  if (ncbValue && ["NA", "no", "No", "na"].includes(ncbValue.trim().toLowerCase())) {
    return "no";
  }
  return "yes";
};

export const TataPDFParsing = async (req, res) => {
  const filePath = req.files["file"][0].path;
  const { companyName, policyType, broker,brokerId } = req.body;

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  try {
    const pdfExtract = new PDFExtract();
    pdfExtract.extract(filePath, {}, async (err, data) => {
      if (err) {
        console.error("Error extracting PDF:", err);
        return res.status(500).json({ message: "Error extracting PDF", error: err });
      }

      const extractedText = data.pages
        .map((page) => page.content.map((item) => item.str).join(" "))
        .join("\n");

      const rawPolicyType = extractField(/Policy Type\s*:\s*([A-Za-z\s-]+)/i, extractedText);

      let finalPolicyType = rawPolicyType;

      if (rawPolicyType === "Auto Secure - Commercial Vehicle Package Policy - Passenger Carrying Vehicle  Commercial Class") {
        const policyTypeData = await policyTypeSchema.findOne({ type: rawPolicyType });
        finalPolicyType = policyTypeData?.value || "Comprehensive/ Package";
      }

      const issueDate = moment(extractField(/Own Damage period of insurance desired from\*:\s*(\d{2}\/\d{2}\/\d{4})/, extractedText), "DD/MM/YYYY").format("MM-DD-YYYY") || null;
      const endDate = moment(extractField(/to Midnight of (\d{2}\/\d{2}\/\d{4})/, extractedText), "DD/MM/YYYY").format("MM-DD-YYYY") || null;

      const extractedData = {
        policyNumber: extractField(/Policy Number:\s*([\d\s]+)/, extractedText),
        caseType: extractCaseType(extractField(/Policy Number:\s*([\d\s]+)/, extractedText)),
        netPremium: parseFloat(extractField(/NET PREMIUM \(A\+B\+C\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        idv: parseFloat(extractIDV(extractedText)) || null,
        ...extractVehicleDetailsDynamic(extractedText),
        policyType: finalPolicyType,
        fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/i, extractedText),
        tp: parseFloat(extractField(/TOTAL\s*LIABILITY\s*PREMIUM\s*\(B\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        od: parseFloat(extractField(/TOTAL\s*OWN\s*DAMAGE\s*PREMIUM\s*\(A\)\s*₹\s*([\d,.]+)/i, extractedText)) || null,
        issueDate,
        endDate,
        tenure: extractTypeOfCover(extractedText),
        fullName: extractFullName(extractedText),
        phoneNumber: extractField(/Contact Number:\s*(\d{10})/, extractedText),
        rto: extractRtoAndVehicleNumber(extractField(/Registration\s*Number:\s*([A-Za-z0-9]+)/, extractedText)).rto,
        vehicleNumber: extractRtoAndVehicleNumber(extractField(/Registration\s*Number:\s*([A-Za-z0-9]+)/, extractedText)).vehicleNumber,
        productType: extractProductType(extractedText),
        finalPremium: extractFinalPremium(extractedText),
        category: "motor",
        ncb: extractNCB(extractedText), // Add the NCB extraction
        companyName,
        policyType, 
        broker,
        brokerId
      };

      return res.status(200).json({
        message: "PDF data extracted successfully",
        data: extractedData,
        status: "Success",
      });
    });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return res.status(500).json({
      message: "Error parsing PDF",
      error: error.message,
      status: "error",
    });
  }
};
