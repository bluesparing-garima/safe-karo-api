import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Function to determine the folder name based on the document type
const getFolderName = (document) => {
  const baseUploadPath = 'uploads/';
  switch (document) {
    case 'teamDocuments':
      return path.join(baseUploadPath, 'teamDocuments');
    case 'bookingRequest':
      return path.join(baseUploadPath, 'bookingRequest');
    case 'motorPolicy':
      return path.join(baseUploadPath, 'motorPolicy');
    default:
      return baseUploadPath;
  }
};

// Ensure the directory exists, if not, create it
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { document } = req.body;
    const folder = getFolderName(document);
    ensureDirExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const { fullName, docName, partnerId } = req.body;
    const uniqueSuffix = `${fullName}_${docName}_${partnerId}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type! Please upload an image, a PDF document, or an Excel file.'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter,
}).any();

// Middleware to handle file uploads
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', uploadMiddleware, (req, res) => {
  res.status(200).json({ message: 'Files uploaded successfully!', files: req.files });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
