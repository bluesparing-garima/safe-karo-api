import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export const uploadAndExtractPDF = async (req, res) => {
  try {
    if (!req.files || !req.files.other) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Assuming you're uploading the PDF under the 'other' field
    const pdfFile = req.files.other[0]; 
    const filePath = pdfFile.path;
    console.log("File uploaded to:", filePath);

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text;

    const extractField = (regex, text) => {
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const extractedData = {
      policyNumber: extractField(/Policy Number:\s*([A-Za-z0-9\s]+)/, text),
      basicODPremium: extractField(/Basic OD Premium\s*₹\s*([\d,.]+)/, text),
      basicTPPremium: extractField(/Basic TP premium\s*₹\s*([\d,.]+)/, text),
      netPremium: extractField(/NET PREMIUM \(A\+B\+C\)\s*₹\s*([\d,.]+)/, text),
      totalIDV: extractField(/Total IDV\s*₹\s*([\d,.]+)/, text),
      mfgYear: extractField(/Mfg\. Year\s*([\d]{4})/, text),
      policyType: extractField(/Policy Type\s*:\s*([A-Za-z\s-]+)/, text),
      fuelType: extractField(/Fuel Type\s*:\s*([A-Za-z]+)/, text),
    };

    return res.status(200).json({
      message: "PDF uploaded and data extracted successfully",
      data: extractedData,
    });
  } catch (error) {
    console.error("Error extracting data:", error.message);
    return res.status(500).json({
      message: "Failed to extract data from PDF",
      error: error.message,
    });
  }
};
