import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    cb(new Error("Unsupported file type! Please upload an image, a PDF document, or an Excel file."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
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
  { name: "file", maxCount: 1 },
]);

const compressImageToSize = async (filePath, targetSize = 100000) => {
  let quality = 80;
  let compressedPath = filePath;
  let fileSize = statSync(filePath).size;

  while (fileSize > targetSize && quality > 10) {
    compressedPath = `${filePath}-compressed.jpg`;
    await sharp(filePath)
      .resize(700)
      .jpeg({ quality })
      .toFile(compressedPath);

    fileSize = statSync(compressedPath).size;
    quality -= 10;
  }

  fs.unlinkSync(filePath); 
  return compressedPath;
};

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
      if (req.files && req.files.image) {
        const imageFilePath = req.files.image[0].path;
        const compressedImagePath = await compressImageToSize(imageFilePath, 100000);
        req.files.image[0].path = compressedImagePath;
      }

      if (req.files && req.files.file) {
        const pdfFilePath = req.files.file[0].path;
        const compressedPDFPath = `${pdfFilePath}-compressed.pdf`;

        compressPDFWithGhostscript(pdfFilePath, compressedPDFPath, 500000, (error, finalPath) => {
          if (error) {
            return res.status(500).json({ message: "PDF compression failed", error: error.message });
          }

          req.files.file[0].path = finalPath;
          next();
        });
      } else {
        next();
      }
    } catch (compressionError) {
      return res.status(500).json({ message: "File compression failed", error: compressionError.message });
    }
  });
};

export default upload;
