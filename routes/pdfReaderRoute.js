import express from "express";
import { handleFileUpload } from "../middlewares/pdfMiddleware.js";
import {
  TataPDFParsing,
  TataPDFParsingTP,
} from "../controller/pdfReaderController.js";
import logActivity from "../middlewares/logActivity.js";

const router = express.Router();

router.post("/upload", logActivity, handleFileUpload, TataPDFParsing);
router.post("/tp-upload", logActivity, handleFileUpload, TataPDFParsingTP);
export default router;
