// routes/partnerIdRoutes.js
import express from 'express';
import { uploadPartnerIdExcel, getAllPartners } from '../controller/adminController/partnerController.js';

const router = express.Router();

// Define routes
router.post('/', uploadPartnerIdExcel);
router.get('/', getAllPartners);

export default router;