import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
}).single('file'); // Single PDF file upload

const compressPDFWithGhostscript = (inputPath, outputPath, targetSize) => {
  return new Promise((resolve, reject) => {
    const gsCommand = `"C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    exec(gsCommand, async (error) => {
      if (error) {
        return reject(new Error(`Error during Ghostscript compression: ${error.message}`));
      }

      try {
        const stats = await fs.stat(outputPath);  // Use fs.promises.stat for async/await
        const fileSize = stats.size;

        if (fileSize > targetSize) {
          console.warn(`Warning: Compressed PDF is larger than target size (${targetSize} bytes).`);
        }

        await fs.unlink(inputPath);  // Remove the original PDF file
        resolve(outputPath);
      } catch (fsError) {
        reject(fsError);
      }
    });
  });
};


// PDF compression API
router.post('/compress', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Multer error during file upload.', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'File upload error.', error: err.message });
    }

    const pdfFilePath = req.file.path;
    const compressedPDFPath = `${pdfFilePath}-compressed.pdf`;
    const targetSize = 500000; // Target size of 500 KB for compressed PDF

    compressPDFWithGhostscript(pdfFilePath, compressedPDFPath, targetSize, (error, finalPath) => {
      if (error) {
        return res.status(500).json({ message: 'PDF compression failed', error: error.message });
      }

      // Send the compressed file back to the client
      res.download(finalPath, (downloadErr) => {
        if (downloadErr) {
          console.error(`Error sending file: ${downloadErr.message}`);
        }
        fs.unlinkSync(finalPath); // Clean up the compressed file after download
      });
    });
  });
});

export default router;
