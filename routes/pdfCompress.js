import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import pLimit from 'p-limit'; // Ensure this import is included
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
}).array('files', 10000);

// Function to execute Ghostscript command
const executeGsCommand = (gsCommand) => {
  return new Promise((resolve, reject) => {
    exec(gsCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Ghostscript error: ${error.message}`));
      } else {
        resolve();
      }
    });
  });
};

// PDF compression function
const compressPDF = async (filePath) => {
  const targetSize = 300000;
  const compressionSettings = ['/prepress', '/printer', '/ebook', '/screen'];
  let compressed = false;

  try {
    const tempOutputPath = filePath.replace(/(\.[a-zA-Z]+)$/, '-temp$1');

    for (const setting of compressionSettings) {
      const gsCommand = `"C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${setting} -dDownsampleColorImages=true -dColorImageResolution=15 -dDownsampleGrayImages=true -dGrayImageResolution=15 -dDownsampleMonoImages=true -dMonoImageResolution=15 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${tempOutputPath}" "${filePath}"`;

      try {
        await executeGsCommand(gsCommand);

        const compressedStats = await fs.stat(tempOutputPath);
        if (compressedStats.size < targetSize || compressedStats.size < 800000) {
          await fs.unlink(filePath);
          await fs.rename(tempOutputPath, filePath);
          compressed = true;
          break;
        }
      } catch (err) {
        console.error(`Compression failed for ${filePath}: ${err.message}`);
      }

      try {
        await fs.unlink(tempOutputPath);
      } catch (cleanupErr) {
        console.error(`Error cleaning up temp file: ${cleanupErr.message}`);
      }
    }

  } catch (error) {
    console.error(`Error compressing PDF: ${error.message}`);
  }

  return { compressed };
};

// Image compression function
const compressImage = async (filePath) => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    const outputPath = filePath.replace(path.extname(filePath), `-compressed${path.extname(filePath)}`);

    await image
      .resize({
        width: Math.round(metadata.width * 0.3),
        fit: sharp.fit.inside,
      })
      .toFormat(metadata.format, { quality: 20 })
      .toFile(outputPath);

    const compressedStats = await fs.stat(outputPath);
    if (compressedStats.size < metadata.size && compressedStats.size < 800000) {
      await fs.unlink(filePath);
      await fs.rename(outputPath, filePath);
      return { compressed: true };
    } else {
      await fs.unlink(outputPath);
    }
  } catch (error) {
    console.error(`Error compressing image: ${error.message}`);
  }

  return { compressed: false };
};

// Limit concurrency for compressing files
const limit = pLimit(20); // This defines the concurrency limit

// Compress route handler
router.post('/compress', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Multer error during file upload.', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'File upload error.', error: err.message });
    }

    const files = req.files;
    const processedFiles = [];
    const missingFiles = [];
    const uploadedFiles = files.map(file => file.originalname);

    try {
      await Promise.all(
        files.map((file) =>
          limit(async () => {
            const filePath = file.path;
            let compressed = false;

            try {
              // Always compress PDF files
              if (file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf') {
                const result = await compressPDF(filePath);
                compressed = result.compressed;
              }

              // Always compress image files
              else if (file.mimetype.startsWith('image/')) {
                const result = await compressImage(filePath);
                compressed = result.compressed;
              }

              processedFiles.push({
                fileName: file.originalname,
                compressed: compressed ? 'Yes' : 'No',
              });

            } catch (fileError) {
              missingFiles.push(file.originalname);
              console.error(`Error processing file: ${file.originalname}, ${fileError.message}`);
            }
          })
        )
      );

      const processedFileNames = processedFiles.map(file => file.fileName);
      const unprocessedFiles = uploadedFiles.filter(fileName => !processedFileNames.includes(fileName));
      missingFiles.push(...unprocessedFiles);

      res.json({
        message: 'Files processed successfully.',
        files: processedFiles,
        missingFiles: missingFiles.length > 0 ? missingFiles : null,
      });
    } catch (compressionError) {
      return res.status(500).json({ message: 'Compression failed', error: compressionError.message });
    }
  });
});

export default router;
