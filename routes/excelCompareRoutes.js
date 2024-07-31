import express from 'express';
import {compareExcel,downloadExcel,getAllDataCompare} from '../controller/excelCompare.js';
import logActivity from '../middlewares/logActivity.js';

const router = express.Router();

router.post('/',logActivity,compareExcel);
router.get('/',logActivity,getAllDataCompare);
router.get('/download',logActivity,downloadExcel);

export default router;