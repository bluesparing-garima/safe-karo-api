import fs from 'fs'; 
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

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
  limits: { fileSize: 3000000 }, // 3MB limit
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
  { name: "profileImage", maxCount: 1 },
  { name: "other", maxCount: 1 },
  { name: "file", maxCount: 1 }, // PDF or main file to extract data
]);

// Main file upload handler
export const handleFileUpload = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: "error",
            message: "File size too large. Max allowed size is 3MB."
          });
        }
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(500).json({ message: err.message });
      }
    }

    // Proceed to further handling if needed
    res.status(200).json({ status: "success", message: "File uploaded successfully" });
  });
};

export default upload;
