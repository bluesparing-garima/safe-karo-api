import express from 'express';
import { handleFileUpload } from '../middlewares/uploadMiddleware.js';
import { TataPDFParsing } from '../controller/pdfReaderController.js';
import logActivity from "../middlewares/logActivity.js";

const router = express.Router();

router.post('/upload',logActivity, handleFileUpload, TataPDFParsing);

export default router;
