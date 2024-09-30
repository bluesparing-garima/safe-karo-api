import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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

const compressPDF = async (filePath, targetSize) => {
  const stats = await fs.stat(filePath);
  if (stats.size < targetSize) {
    return { compressed: false }; 
  }

  const compressionSettings = ['/screen', '/ebook', '/printer', '/prepress'];
  const tempOutputPath = filePath.replace('.pdf', '-temp.pdf');

  for (const setting of compressionSettings) {
    const gsCommand = `"C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${setting} -dDownsampleColorImages=true -dColorImageResolution=75 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${tempOutputPath}" "${filePath}"`;

    try {
      await executeGsCommand(gsCommand);
      const compressedStats = await fs.stat(tempOutputPath);

      if (compressedStats.size < stats.size) {
        await fs.unlink(filePath);
        await fs.rename(tempOutputPath, filePath); 

        return { compressed: true };
      } else {
        await fs.unlink(tempOutputPath);
      }
    } catch (error) {
      console.error(`Error compressing with setting ${setting}: ${error.message}`);
      await fs.unlink(tempOutputPath); 
    }
  }

  return { compressed: false };
};

const limit = pLimit(20);

router.post('/compress', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Multer error during file upload.', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'File upload error.', error: err.message });
    }

    const files = req.files;
    const pdfTargetSize = 200000; 
    const processedFiles = [];

    try {
      await Promise.all(files.map(file => limit(async () => {
        const filePath = file.path;

        if (file.mimetype === 'application/pdf') {
          const { compressed } = await compressPDF(filePath, pdfTargetSize);
          if (compressed) {
            processedFiles.push(file.originalname); 
          }
        } else {
          processedFiles.push(file.originalname);
        }
      })));

      res.json({ message: 'Files processed successfully.', files: processedFiles });

    } catch (compressionError) {
      return res.status(500).json({ message: 'Compression failed', error: compressionError.message });
    }
  });
});

export default router;
