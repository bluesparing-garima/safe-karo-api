import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
import moment from "moment";
import policyTypeSchema from "../models/adminModels/policyTypeSchema.js";
import path from "path";
import { fileURLToPath } from "url";

// Helper variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to extract text based on regex pattern
const extractField = (regex, text) => {
  const match = text.match(regex);
  return match && match[1] ? match[1].trim() : null;
};

const REGEX_PATTERNS = {
  vehicleNumber: /Registration\s*Number\s*:\s*([A-Za-z0-9\s]+)/i,
  vehicleNumberAlt: /Registration no :\s*([A-Za-z0-9\s]+) Registration Authority/i,

  makeModel: /Make\/Model\s*:\s*([\w\s]+)\/([\w\s]+)|Make\s*:\s*([\w\s]+)[\n\s]*Model\s*:\s*([\w\s]+)/i,

  mfgYear: /Mfg Year :\s*(\d+)/,
  seatingCapacity: /Seating Capacity \(including driver\) :\s*(\d+)/,
  cc: /Engine\/Battery\s*Capacity\s*\(CC\/\s*KW\)\s*:\s*(\d+)/i,
};

const extractVehicleDetails = (text) => {
  if (!text) return {};

  const vehicleNumberRaw =
    extractField(REGEX_PATTERNS.vehicleNumber, text) ||
    extractField(REGEX_PATTERNS.vehicleNumberAlt, text);

  // Remove spaces from the vehicle number if it exists
  const vehicleNumber = vehicleNumberRaw ? vehicleNumberRaw.replace(/\s+/g, '') : null;
  const rto = vehicleNumber ? vehicleNumber.substring(0, 4).trim() : null;

  const makeModelMatch = text.match(REGEX_PATTERNS.makeModel);
  let make = null;
  let model = null;

  if (makeModelMatch) {
    if (makeModelMatch[1] && makeModelMatch[2]) {
      make = makeModelMatch[1].trim();
      model = makeModelMatch[2].replace(/ Fuel Type/i, '').trim();
    } else if (makeModelMatch[3] && makeModelMatch[4]) {
      make = makeModelMatch[3].trim();
      model = makeModelMatch[4].replace(/ Fuel Type/i, '').trim();
    }
  }

  return {
    rto,
    vehicleNumber,
    make,
    model,
    mfgYear: extractField(REGEX_PATTERNS.mfgYear, text),
    seatingCapacity: extractField(REGEX_PATTERNS.seatingCapacity, text),
    cc: extractField(REGEX_PATTERNS.cc, text),
  };
};

// Extract case type based on policy number
const extractCaseType = (policyNumber) => {
  if (!policyNumber) return null;
  return policyNumber.toLowerCase().includes("new") ? "New" : "Rollover";
};

const extractIDV = (text) => {
  const idvPattern1 = /Total\s*IDV\s*\(?₹?\)?\s*[\n\s]*([\d,.]+)/i;
  const idvPattern2 = /Vehicle\s*IDV\s*\(?₹?\)?\s*[\n\s]*([\d,.]+)/i;

  const idvMatch =
    extractField(idvPattern1, text) || extractField(idvPattern2, text);
  
  return idvMatch ? parseFloat(idvMatch.replace(/,/g, "")) : null;
};

const extractPhoneNumber = (text) => {
  const phonePattern = /Customer contact number :\s*(\d{10})/i;
  return (
    extractField(phonePattern, text) ||
    extractField(/Contact Number:\s*(\d{10})/, text)
  );
};

// Extract full name of the insured
const extractFullName = (text) => {
  const fullNamePatterns = [
    /Name:\s*([A-Za-z\s]+)\s*Address/i,
    /Insured Name :\s*([A-Za-z\s.]+)/i,
  ];

  for (const pattern of fullNamePatterns) {
    const match = extractField(pattern, text);
    if (match) {
      return match;
    }
  }

  return null;
};

const extractPolicyNumber = (text) => {
  const patterns = [
    /Policy No & Certificate No :\s*([\d\s]+)/,
    /Policy Number:\s*([\d\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = extractField(pattern, text);
    if (match) {
      return match;
    }
  }

  return null;
};

// Extract product type
const extractProductType = (text) => {
  const productTypePattern =
    /Commercial Class:\s*([A-Za-z\s]+)\s*Alternate Policy No/i;
  return extractField(productTypePattern, text);
};

// Extract final premium amount
const extractFinalPremium = (text) => {
  const premiumPattern =
    /(?:Total Policy Premium|Premium amount)\s*[:₹]?\s*([\d,.]+)/i;
  const match = text.match(premiumPattern);

  if (match) {
    return parseFloat(match[1].replace(/,/g, ""));
  }

  return null;
};

// Extract the type of cover based on the term lengths for OD and TP
const extractTypeOfCover = (text) => {
  const typeOfCoverPattern =
    /Package\s*\((\d+)\s*year\s*OD\s*\+\s*(\d+)\s*year\s*TP\)/i;
  const match = text.match(typeOfCoverPattern);

  if (match) {
    const [odYear, tpYear] = match.slice(1, 3).map(Number);
    return Math.min(odYear, tpYear);
  }
  return 0;
};

// Extract NCB (No Claim Bonus)
const extractNCB = (text) => {
  const claimPattern = /Claim in Previous Policy Period\s*:\s*(No|0%|NA)/i;
  const ncbClaimedPattern = /NCB claimed\s*:\s*(\d+\s?%|Yes|No)/i;

  const claimMatch = text.match(claimPattern);
  const ncbClaimedMatch = text.match(ncbClaimedPattern);

  if (
    claimMatch &&
    (claimMatch[1] === "No" || claimMatch[1] === "0%" || claimMatch[1] === "NA")
  ) {
    return "no";
  }

  if (ncbClaimedMatch) {
    const ncbValue = ncbClaimedMatch[1].trim().toLowerCase();
    if (ncbValue === "no" || ncbValue === "na") {
      return "no";
    }
    if (ncbValue === "yes" || /\d+\s?%/.test(ncbValue)) {
      return "yes";
    }
  }

  return null;
};

// Extract issue and end dates based on new patterns
const extractTenureAndIssueDate = (text, policyType) => {
  const patterns = [
    {
      type: 'Third Party Only/ TP',
      regex: [
        /Liability period of insurance desired from\*:\s*([\d/]+)\s*to\s*Midnight of\s*([\d/]+)/i,
        /TP Cover Period\s*([\d\w\s']+)\(\d{2}:\d{2}Hrs\)\s*([\d\w\s']+)\s*\(Midnight\)/i
      ]
    },
    {
      type: ['Own Damage Only/ OD', 'Comprehensive/ Package'],
      regex: [
        /Own Damage period of insurance desired from\*:\s*([\d/]+)\s*to\s*Midnight of\s*([\d/]+)/i,
        /OD Cover Period\s*([\d\w\s']+)\(\d{2}:\d{2}Hrs\)\s*([\d\w\s']+)\s*\(Midnight\)/i
      ]
    }
  ];

  let matchedPattern = null;
  let issueDateRaw, endDateRaw;

  for (const patternObj of patterns) {
    if (
      patternObj.type === policyType || 
      (Array.isArray(patternObj.type) && patternObj.type.includes(policyType))
    ) {
      for (const regex of patternObj.regex) {
        const match = text.match(regex);
        if (match) {
          issueDateRaw = match[1];
          endDateRaw = match[2];
          matchedPattern = regex;
          break;
        }
      }
    }
    if (matchedPattern) break;
  }

  if (!matchedPattern) {
    return { tenure: null, issueDate: null, endDate: null };
  }

  const issueDate = moment(issueDateRaw, ["DD/MM/YYYY", "DD/MM/YY", "DD MMM 'YY"]);
  const endDate = moment(endDateRaw, ["DD/MM/YYYY", "DD/MM/YY", "DD MMM 'YY"]);

  let tenure = endDate.diff(issueDate, 'years', true);

  tenure = tenure < 1 && endDate.isAfter(issueDate) ? 1 : Math.floor(tenure);

  return {
    tenure: Math.max(tenure, 1),
    issueDate: issueDate.isValid() ? issueDate.format("MM-DD-YYYY") : null,
    endDate: endDate.isValid() ? endDate.format("MM-DD-YYYY") : null
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
        return res
          .status(500)
          .json({ message: "Error extracting PDF", error: err });
      }

      const extractedText = data.pages
        .map((page) => page.content.map((item) => item.str).join(" "))
        .join("\n");

      const rawPolicyType = extractField(
        /Policy Type\s*:\s*([A-Za-z\s-]+)/i,
        extractedText
      );
      let finalPolicyType = rawPolicyType;

      if (
        rawPolicyType ===
        "Auto Secure - Commercial Vehicle Package Policy - Passenger Carrying Vehicle  Commercial Class"
      ) {
        const policyTypeData = await policyTypeSchema.findOne({
          type: rawPolicyType,
        });
        finalPolicyType = policyTypeData?.value || "Comprehensive/Package";
      }

      const { tenure,issueDate, endDate } = extractTenureAndIssueDate(extractedText, policyType);


      const extractTP = (text) => {
        const tpPatterns = [
          /TOTAL LIABILITY PREMIUM\s*₹?\s*([\d,.]+)/i,
          /TOTAL LIABILITY PREMIUM \(B\)\s*₹?\s*([\d,.]+)/i,
          /Basic\s+TP\s+premium\s*[:₹]?\s*([\d,.]+)/i,
        ];

        for (const pattern of tpPatterns) {
          const value = extractField(pattern, text);
          if (value) return parseFloat(value.replace(/,/g, ""));
        }

        return null;
      };

      const extractOwnDamagePremium = (text) => {
        const odPatterns = [
          /TOTAL OWN DAMAGE PREMIUM\s*₹?\s*([\d,.]+)/i,
          /TOTAL OWN DAMAGE PREMIUM \(A\)\s*₹?\s*([\d,.]+)/i,
          /Total Own Damage Premium \(A\)\s*₹?\s*([\d,.]+)/i,
        ];

        for (const pattern of odPatterns) {
          const value = extractField(pattern, text);
          if (value) return parseFloat(value.replace(/,/g, ""));
        }

        return null;
      };
      const extractNetPremium = (text) => {
        const netPatterns = [
          /Net Premium \(A\+C\)\s*₹\s*([\d,.]+)/i,
          /Net Premium \(A\+B\+C\)\s*₹\s*([\d,.]+)/i,
          /Net Premium \(B\)\s*₹\s*([\d,.]+)/i,
          /Net Premium \(B\+D\)\s*₹\s*([\d,.]+)/i,
        ];
      
        for (const pattern of netPatterns) {
          const match = text.match(pattern);
          if (match) {
            return parseFloat(match[1].replace(/,/g, ""));
          }
        }
      
        return null;
      };      

      let extractedData = {
        policyNumber: extractPolicyNumber(extractedText),
        caseType: extractCaseType(
          extractField(/Policy Number:\s*([\d\s]+)/, extractedText)
        ),
        netPremium: extractNetPremium(extractedText),
        finalPremium: extractFinalPremium(extractedText),
        idv: parseFloat(extractIDV(extractedText)) || null,
        ...extractVehicleDetails(extractedText),
        policyType: finalPolicyType,
        fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/i, extractedText),
        issueDate,
        endDate,
        tenure,
        fullName: extractFullName(extractedText),
        phoneNumber: extractPhoneNumber(extractedText),
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
      const od = extractOwnDamagePremium(extractedText);

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

/*------------------------------------ TP and OD tata ------------------------------------------ 

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

*/