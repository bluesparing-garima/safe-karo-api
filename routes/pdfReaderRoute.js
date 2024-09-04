import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  PDFParsing,
  getAllExtractedData,
  getExtractedDataById,
  updateExtractedDataById,
  deleteExtractedDataById,
} from '../controller/pdfReaderController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type!"), false);
    }
  },
}).fields([{ name: "file", maxCount: 1 }]);

const router = express.Router();

// Create - PDF upload and extraction
router.post('/upload-extract', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(500).json({ message: err.message });
      }
    }
    // Proceed to extract data if no errors
    PDFParsing(req, res);
  });
});

router.get('/extracted-data', getAllExtractedData);

router.get('/extracted-data/:id', getExtractedDataById);

router.put('/extracted-data/:id', updateExtractedDataById);

router.delete('/extracted-data/:id', deleteExtractedDataById);

export default router;
