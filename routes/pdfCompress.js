import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

// Check file type function
const checkFileType = (file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type! Please upload an image, PDF, or Excel file."), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).fields([
  { name: "rcFront", maxCount: 1 },
  { name: "rcBack", maxCount: 1 },
  { name: "survey", maxCount: 1 },
  { name: "puc", maxCount: 1 },
  { name: "fitness", maxCount: 1 },
  { name: "proposal", maxCount: 1 },
  { name: "currentPolicy", maxCount: 1 },
  { name: "previousPolicy", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "adharCardFront", maxCount: 1 },
  { name: "adharCardBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "qualification", maxCount: 1 },
  { name: "bankProof", maxCount: 1 },
  { name: "experience", maxCount: 1 },
  { name: "quotationImage", maxCount: 1 },
  { name: "other", maxCount: 1 },
  { name: "file", maxCount: 1 }, // PDF or main file to extract data
]);

// PDF Compression with Ghostscript
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

    fs.unlinkSync(inputPath); // Remove the original file after compression

    callback(null, outputPath);
  });
};

// Function to extract data from PDF (implement your extraction logic here)
const extractDataFromPDF = (pdfFilePath) => {
  // This is a placeholder; replace with your actual PDF extraction logic.
  // You can use libraries like 'pdf-parse' or any other suitable tool for extraction.
  
  // Simulate extraction result
  const extractedData = {
    title: "Sample PDF Title",
    content: "Extracted content goes here...",
    // Add more fields as needed
  };

  return extractedData;
};

// Main file upload handler
export const handleFileUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(500).json({ message: err.message });
      }
    }

    try {
      // Step 1: Extract data from the original PDF (if PDF file is uploaded)
      if (req.files && req.files.file) {
        const pdfFilePath = req.files.file[0].path;
        console.log("PDF uploaded:", pdfFilePath);

        // Extract data before compressing
        const extractedData = extractDataFromPDF(pdfFilePath);
        req.extractedData = extractedData; // Store the extracted data for further use

        console.log("PDF data extracted:", extractedData);

        // Step 2: Compress PDF after data extraction
        const compressedPDFPath = `${pdfFilePath}-compressed.pdf`;
        compressPDFWithGhostscript(pdfFilePath, compressedPDFPath, 500000, (error, finalPath) => {
          if (error) {
            return res.status(500).json({ message: "PDF compression failed", error: error.message });
          }

          // Update the file path after compression
          req.files.file[0].path = finalPath;
          console.log("PDF compressed to:", finalPath);
          next(); // Proceed to the next middleware after compression
        });
      } else {
        // If no PDF file, move to next middleware
        next();
      }
    } catch (compressionError) {
      return res.status(500).json({ message: "File processing failed", error: compressionError.message });
    }
  });
};

export default upload;