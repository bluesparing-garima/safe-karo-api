import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadAndExtractPDF } from "../controller/pdfReaderController.js";

const router = express.Router();

// Define the route for PDF upload and extraction
router.post("/upload-extract", upload, uploadAndExtractPDF);

export default router;
