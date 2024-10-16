import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
import moment from "moment";
import policyTypeSchema from "../models/adminModels/policyTypeSchema.js";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Helper variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to extract text based on regex pattern
const extractField = (pattern, text) => {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

// Extract RTO and vehicle number
const extractRtoAndVehicleNumber = (registrationNumber) => {
  if (!registrationNumber) return { rto: null, vehicleNumber: null };
  const rto = registrationNumber.substring(0, 4);
  return { rto, vehicleNumber: registrationNumber };
};

// Extract case type based on policy number
const extractCaseType = (policyNumber) => {
  if (!policyNumber) return null;
  return policyNumber.toLowerCase().includes("new") ? "New" : "Rollover";
};

// Extract IDV (Insured Declared Value)
const extractIDV = (text) => {
  const idvPattern = /Total\s*IDV\s*₹?\s*(\d+)/i;
  return extractField(idvPattern, text);
};

// Extract vehicle details
const extractVehicleDetailsDynamic = (text) => {
  const vehicleRegex = /Registration\s*Number\s*[\n\s]*([A-Za-z0-9]+)/i;
  const makeModelRegex = /Make\s*\/\s*Model\s*\/\s*Body Type\s*\/\s*Segment\s*:\s*([A-Za-z\s]+)\/([A-Za-z0-9\s]+)/i; // Adjusted for correct format
  const mfgYearRegex = /Mfg\.\s*Year\s*:\s*(\d{4})/i;
  const ccKwRegex = /CC\/KW\s*:\s*(\d+)/i;
  const capacityRegex = /Licensed Carrying Capacity Including Driver\s*:\s*(\d+)/i;

  const vehicleNumber = extractField(vehicleRegex, text);
  const makeModel = extractField(makeModelRegex, text);
  const [make, model] = makeModel ? makeModel.split('/') : [null, null];

  return {
    vehicleNumber: extractField(vehicleRegex, text),
    make: make?.trim(),
    model: model?.trim(),
    mfgYear: extractField(mfgYearRegex, text),
    cc: extractField(ccKwRegex, text),
    seatingCapacity: extractField(capacityRegex, text),
  };
};

// Extract full name of the insured
const extractFullName = (text) => {
  const fullNamePattern = /Name:\s*([A-Za-z\s]+)\s*Address/i;
  return extractField(fullNamePattern, text);
};

// Extract product type
const extractProductType = (text) => {
  const productTypePattern = /Commercial Class:\s*([A-Za-z\s]+)\s*Alternate Policy No/i;
  return extractField(productTypePattern, text);
};

// Extract final premium amount
const extractFinalPremium = (text) => {
  const finalPremiumPattern = /TOTAL POLICY PREMIUM\s*₹?\s*([\d,.]+)/i;
  const premium = extractField(finalPremiumPattern, text);
  return premium ? parseFloat(premium.replace(/,/g, "")) : null;
};

// Extract the type of cover based on the term lengths for OD and TP
const extractTypeOfCover = (text) => {
  const typeOfCoverPattern = /Package\s*\((\d+)\s*year\s*OD\s*\+\s*(\d+)\s*year\s*TP\)/i;
  const match = text.match(typeOfCoverPattern);

  if (match) {
    const [odYear, tpYear] = match.slice(1, 3).map(Number);
    return Math.min(odYear, tpYear);
  }
  return 0;
};

// Extract NCB (No Claim Bonus)
const extractNCB = (text) => {
  const ncbPattern = /NCB claimed\s*:\s*([A-Za-z]+)/i;
  const ncbValue = extractField(ncbPattern, text);
  if (ncbValue && ["NA", "no", "No", "na"].includes(ncbValue.trim().toLowerCase())) {
    return "no";
  }
  return "yes";
};

// Compress PDF using Ghostscript
const compressPDFWithGhostscript = (inputPath, outputPath, targetSize, callback) => {
  const gsCommand = `"C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;

  exec(gsCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during Ghostscript compression: ${error.message}`);
      return callback(error, null);
    }
    const fileSize = fs.statSync(outputPath).size;

    if (fileSize > targetSize) {
      console.warn(`Warning: Final compressed file is larger than target size of ${targetSize} bytes.`);
    }

    fs.unlinkSync(inputPath);
    callback(null, outputPath);
  });
};

// Extract issue and end dates based on new patterns
const extractIssueAndEndDates = (text) => {
  const issueDatePattern1 = /Policy Period:\s*From\s*00:00\s*Hours\s*on\s*(\d{2}\/\d{2}\/\d{4})/i;
  const endDatePattern1 = /to\s*Midnight\s*of\s*(\d{2}\/\d{2}\/\d{4})/i;

  const issueDatePattern2 = /Liability period of insurance desired from\*:\s*(\d{2}\/\d{2}\/\d{4})/i;
  const endDatePattern2 = /to\s*Midnight\s*of\s*(\d{2}\/\d{2}\/\d{4})/i;

  const issueDate1 = extractField(issueDatePattern1, text);
  const endDate1 = extractField(endDatePattern1, text);

  const issueDate2 = extractField(issueDatePattern2, text);
  const endDate2 = extractField(endDatePattern2, text);

  // Format dates to DD-MM-YYYY
  const formatDate = (date) => date ? moment(date, "DD/MM/YYYY").format("DD-MM-YYYY") : null;

  return {
    issueDate: formatDate(issueDate1 || issueDate2),
    endDate: formatDate(endDate1 || endDate2),
  };
};

export const TataPDFParsing = async (req, res) => {
  const filePath = req.files["file"][0].path;
  const { companyName, policyType, broker, brokerId } = req.body;

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
        finalPolicyType = policyTypeData?.value || "Comprehensive/Package";
      }

      const { issueDate, endDate } = extractIssueAndEndDates(extractedText);
      const extractTP = (text) => {
        const tpPatterns = [
          /TOTAL LIABILITY PREMIUM\s*₹?\s*([\d,.]+)/i,
          /TOTAL LIABILITY PREMIUM \(B\)\s*₹?\s*([\d,.]+)/i
        ];
        for (const pattern of tpPatterns) {
          const value = extractField(pattern, text);
          if (value) return parseFloat(value.replace(/,/g, ""));
        }
        return null;
      };

      const extractOD = (text) => {
        const odPatterns = [
          /TOTAL OWN DAMAGE PREMIUM\s*₹?\s*([\d,.]+)/i,
          /TOTAL OWN DAMAGE PREMIUM \(A\)\s*₹?\s*([\d,.]+)/i
        ];
        for (const pattern of odPatterns) {
          const value = extractField(pattern, text);
          if (value) return parseFloat(value.replace(/,/g, ""));
        }
        return null;
      };

      const extractNetPremium = (text) => {
        const netPremiumPatterns = [
          /NET PREMIUM \(B\+D\)\s*₹?\s*([\d,.]+)/i,
          /NET PREMIUM \(A\+B\+C\+D\)\s*₹?\s*([\d,.]+)/i,
          /NET PREMIUM \(A\+B\+C\)\s*₹?\s*([\d,.]+)/i
        ];
        for (const pattern of netPremiumPatterns) {
          const value = extractField(pattern, text);
          if (value) return parseFloat(value.replace(/,/g, ""));
        }
        return null;
      };

      let extractedData = {
        policyNumber: extractField(/Policy Number:\s*([\d\s]+)/, extractedText),
        caseType: extractCaseType(extractField(/Policy Number:\s*([\d\s]+)/, extractedText)),
        netPremium: extractNetPremium(extractedText),
        finalPremium: extractFinalPremium(extractedText),
        idv: parseFloat(extractIDV(extractedText)) || null,
        ...extractVehicleDetailsDynamic(extractedText), 
        policyType: finalPolicyType,
        fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/i, extractedText),
        issueDate,
        endDate,
        tenure: extractTypeOfCover(extractedText),
        fullName: extractFullName(extractedText),
        phoneNumber: extractField(/Contact Number:\s*(\d{10})/, extractedText),
        rto: extractRtoAndVehicleNumber(extractField(/Registration\s*Number\s*:\s*([A-Za-z0-9]+)/, extractedText)).rto, 
        vehicleNumber: extractRtoAndVehicleNumber(extractField(/Registration\s*Number\s*:\s*([A-Za-z0-9]+)/, extractedText)).vehicleNumber,
        productType: extractProductType(extractedText),
        category: "motor",
        ncb: extractNCB(extractedText),
        companyName,
        policyType,
        broker,
        brokerId,
      };

      // Conditionally include or exclude tp and od based on policyType
      const tp = extractTP(extractedText);
      const od = extractOD(extractedText);

      if (policyType === "Third Party Only/ TP") {
        extractedData.tp = tp;
        delete extractedData.od;
      } else if (policyType === "Own Damage Only/ OD") {
        extractedData.od = od;
        delete extractedData.tp;
      } else if (policyType === "Comprehensive/ Package") {
        extractedData.tp = tp;
        extractedData.od = od;
      }

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

/*------------------------------------ TP and OD tata ------------------------------------------ */

const extractTenureAndIssueDate = (text) => {
  const tenurePattern = /TP cover period\s*:\s*([\d\w\s'():]+) to ([\d\w\s'():]+)/i;
  const match = text.match(tenurePattern);

  if (match) {
    const issueDateRaw = match[1];
    const endDateRaw = match[2];

    const issueDate = moment(issueDateRaw, "DD MMM 'YY");
    const endDate = moment(endDateRaw, "DD MMM 'YY");

    const tenure = endDate.diff(issueDate, 'years', true);
    
    return {
      tenure: Math.max(Math.floor(tenure), 1),
      issueDate: issueDate.isValid() ? issueDate.format("MM-DD-YYYY") : null,
      endDate: endDate.isValid() ? endDate.format("MM-DD-YYYY") : null
    };
  }
  return { tenure: null, issueDate: null, endDate: null };
};

const extractPhoneNumber = (text) => {
  const phonePattern = /Customer contact number :\s*(\d{10})/i;
  return extractField(phonePattern, text);
};

const extractMakeAndModel = (text) => {
  const makeModelPattern = /Make\/Model :\s*([\w\s]+)\/([\w\s]+)/i;
  const match = text.match(makeModelPattern);

  if (match) {
    const make = match[1].trim();
    const model = match[2].replace(/ Fuel Type/i, '').trim();
    return { make, model };
  }
  return { make: null, model: null };
};

const extractFinalPremiumTP = (text) => {
  const premiumPattern = /(?:Total Policy Premium|Premium amount)\s*[:₹]?\s*([\d,.]+)/i;
  const match = text.match(premiumPattern);
  
  if (match) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  
  return null;
};

const IDVExtract = (text) => {
  const idvPattern = /Vehicle IDV\s*\(\s*₹\s*\)\s*([\d,.]+)/i;
  const match = text.match(idvPattern);

  if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
  }

  return null;
};

const NCBExtract = (text) => {
  const claimPattern = /Claim in Previous Policy Period\s*:\s*(No|0%|NA)/i;
  const ncbClaimedPattern = /NCB Claimed\s*:\s*(\d+\s?%|Yes|No)/i;  

  const claimMatch = text.match(claimPattern);
  const ncbClaimedMatch = text.match(ncbClaimedPattern);

  if (claimMatch && (claimMatch[1] === "No" || claimMatch[1] === "0%" || claimMatch[1] === "NA")) {
    return 'no';
  }

  if (ncbClaimedMatch && (ncbClaimedMatch[1] === "Yes" || /\d+\s?%/.test(ncbClaimedMatch[1]))) {
    return 'yes';
  }

  return null;
};

export const TataPDFParsingTP = async (req, res) => {
  const filePath = req.files["file"][0].path;
  const { companyName, policyType, broker, brokerId } = req.body;

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

      const registrationDateRaw = extractField(/Date of Registration :\s*([\d/]+)/, extractedText);
      const registrationDate = registrationDateRaw ? moment(registrationDateRaw, "DD/MM/YYYY").format("MM-DD-YYYY") : null;

      const { make, model } = extractMakeAndModel(extractedText);
      const finalPremium = extractFinalPremiumTP(extractedText);

      const extractNetPremium = (text) => {
        const netPatterns = [
          /Net Premium \(A\+C\)\s*₹\s*([\d,.]+)/i,
          /Net Premium \(A\+B\+C\)\s*₹\s*([\d,.]+)/i,
          /Net Premium \(B\)\s*₹\s*([\d,.]+)/i,
        ];
      
        for (const pattern of netPatterns) {
          const match = text.match(pattern);
          if (match) {
            return parseFloat(match[1].replace(/,/g, ""));
          }
        }
      
        return null;
      };

      const tp = parseFloat(
        extractField(/Basic\s+TP\s+premium\s*[:₹]?\s*([\d,.]+)/i, extractedText)?.replace(/,/g, "")
      ) || null;

      const extractOwnDamagePremium = (text) => {
        const odPattern = /Total Own Damage Premium \(A\)\s*₹\s*([\d,.]+)/i;
        const match = text.match(odPattern);
        return match ? parseFloat(match[1].replace(/,/g, "")) : null;
      };

      const vehicleNumberRaw = extractField(/Registration no :\s*([A-Za-z0-9\s]+) Registration Authority/, extractedText);
      const vehicleNumber = vehicleNumberRaw ? vehicleNumberRaw.trim() : null;

      const { tenure, issueDate, endDate } = extractTenureAndIssueDate(extractedText);

      const extractedData = {
        policyNumber: extractField(/Policy No & Certificate No :\s*([\d\s]+)/, extractedText),
        fullName: extractField(/Insured Name :\s*([A-Za-z\s.]+)/, extractedText),
        vehicleNumber,
        rto: vehicleNumber ? vehicleNumber.substring(0, 5) : null,
        make,
        model,
        fuelType: extractField(/Fuel Type :\s*([A-Za-z]+)/, extractedText),
        cc: extractField(/Engine\/Battery Capacity \(CC\/ KW\) :\s*(\d+)/, extractedText),
        seatingCapacity: extractField(/Seating Capacity \(including driver\) :\s*(\d+)/, extractedText),
        mfgYear: extractField(/Mfg Year :\s*(\d+)/, extractedText),
        registrationDate,
        finalPremium,
        netPremium: extractNetPremium(extractedText),
        broker: extractField(/Agent Name :\s*([A-Za-z\s]+)/, extractedText),
        ncb: NCBExtract(extractedText),
        tenure,
        issueDate,
        endDate,
        phoneNumber: extractPhoneNumber(extractedText),
        idv: IDVExtract(extractedText),
        category: "motor",
        companyName,
        policyType,
        broker,
        brokerId,
      };

      // Conditionally include/exclude OD and TP based on policyType
      if (policyType === 'Third Party Only/ TP') {
        extractedData.tp = tp;
        delete extractedData.od; // Remove OD for TP-only policies
      } else if (policyType === 'Own Damage Only/ OD') {
        extractedData.od = extractOwnDamagePremium(extractedText);
        delete extractedData.tp; // Remove TP for OD-only policies
      } else if (policyType === 'Comprehensive/ Package') {
        extractedData.tp = tp;
        extractedData.od = extractOwnDamagePremium(extractedText); // Include both for comprehensive policies
      }

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
