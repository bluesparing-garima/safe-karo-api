import express from 'express'; 
import fs from 'fs/promises';  
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
    cb(null, file.originalname);
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
}).array('files');

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

const compressPDF = async (inputPath, outputPath, targetSize) => {
  const stats = await fs.stat(inputPath);
  if (stats.size < targetSize) {
    return { compressed: false, originalFileRemoved: false };
  }

  const compressionSettings = ['/screen', '/ebook', '/printer', '/prepress'];

  for (const setting of compressionSettings) {
    const gsCommand = `"C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${setting} -dDownsampleColorImages=true -dColorImageResolution=100 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    try {
      await executeGsCommand(gsCommand);
      const compressedStats = await fs.stat(outputPath);

      if (compressedStats.size < targetSize) {
        await fs.unlink(inputPath);
        await fs.rename(outputPath, inputPath);
        return { compressed: true, originalFileRemoved: true };
      }
    } catch (error) {
      console.error(`Error compressing with setting ${setting}: ${error.message}`);
    }
  }

  return { compressed: false, originalFileRemoved: false };
};

router.post('/compress', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Multer error during file upload.', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'File upload error.', error: err.message });
    }

    const files = req.files; 
    const targetSize = 500000;
    const compressedFiles = []; 

    try {
      for (const file of files) {
        const pdfFilePath = file.path; 
        const compressedPDFPath = pdfFilePath.replace('.pdf', '-compressed.pdf'); 
        
        const { compressed, originalFileRemoved } = await compressPDF(pdfFilePath, compressedPDFPath, targetSize);

        if (compressed) {
          compressedFiles.push(file.originalname); // Keep track of the original file name after compression
        }
      }

      res.json({ message: 'Files processed successfully.', files: compressedFiles });
    
    } catch (compressionError) {
      return res.status(500).json({ message: 'PDF compression failed', error: compressionError.message });
    }
  });
});

export default router;
