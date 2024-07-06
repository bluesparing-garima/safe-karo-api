import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images');
    } else if (file.mimetype === 'application/pdf') {
      cb(null, 'uploads/documents');
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, 'uploads/excels');
    } else {
      cb(new Error('Unsupported file type! Please upload an image, a PDF document, or an Excel file.'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type! Please upload an image, a PDF document, or an Excel file.'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter,
}).any(); 


const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export default uploadMiddleware;
