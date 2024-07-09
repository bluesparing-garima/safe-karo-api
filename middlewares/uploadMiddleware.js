// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Function to determine the folder name based on the document type
// const getFolderName = (document) => {
//   const baseUploadPath = "../uploads/";
//   switch (document) {
//     case "teamDocuments":
//       return path.join(baseUploadPath, "teamDocuments");
//     case "bookingRequest":
//       return path.join(baseUploadPath, "bookingRequest");
//     case "motorPolicy":
//       return path.join(baseUploadPath, "motorPolicy");
//     default:
//       return baseUploadPath;
//   }
// };

// // Ensure the directory exists, if not, create it
// const ensureDirExists = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// // Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("Multer", req.body);
//     const { document } = req.body;
//     const folder = getFolderName(document);
//     ensureDirExists(folder);
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//    // const { fullName, docName, partnerId } = req.body;
//     const uniqueSuffix = `${fullName}_${docName}_${partnerId}${path.extname(
//       file.originalname
//     )}`;
//     cb(null, uniqueSuffix);
//   },
// });

// // File filter function
// const fileFilter = (req, file, cb) => {
//   console.log("filter");
//   if (
//     file.mimetype.startsWith("image/") ||
//     file.mimetype === "application/pdf" ||
//     file.mimetype ===
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//     file.mimetype === "application/vnd.ms-excel"
//   ) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Unsupported file type! Please upload an image, a PDF document, or an Excel file."
//       ),
//       false
//     );
//   }
// };
// console.log("sdhfjhsd");
// // Multer upload instance
// const upload = multer({ dest: '../uploads/' })

// // Middleware to handle file uploads
// const uploadMiddleware = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({ message: err.message });
//     }
//     next();
//   });
// };

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // app.post('/upload', uploadMiddleware, (req, res) => {
// //   res.status(200).json({ message: 'Files uploaded successfully!', files: req.files });
// // });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// export default upload;

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set storage engine
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/"),
  filename: (req, file, cb) => {
    const { fullName, partnerId } = req.body;
    const uniqueSuffix = `${fullName}_${partnerId}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
  // filename: (req, file, cb) => {
  //   cb(
  //     null,
  //     file.fieldname + "-" + Date.now() + path.extname(file.originalname)
  //   );
  // },
});

// Check File Type
// function checkFileType(file, cb) {
//   // Allowed ext
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb('Error: Images Only!');
//   }
// }
const checkFileType = (file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
    // file.mimetype ===
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    // file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type! Please upload an image, a PDF document, or an Excel file."
      ),
      false
    );
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // Limit file size to 2MB
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
  { name: "other", maxCount: 1 }, // Change here
]);

export default upload;
